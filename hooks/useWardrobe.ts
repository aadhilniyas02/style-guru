import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WardrobeItemRow } from '../lib/supabase'

export function useWardrobe(userId: string | undefined) {
  const [items, setItems] = useState<WardrobeItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function hydrateItem(item: WardrobeItemRow): WardrobeItemRow {
    const tags = item.tags ?? []
    const specificTag = tags.find(tag => tag.startsWith('specific:'))
    const categoryTag = tags.find(tag => tag.startsWith('category:'))
    const visibleTags = tags.filter(tag => !tag.startsWith('specific:') && !tag.startsWith('category:'))

    return {
      ...item,
      tags: visibleTags,
      specific_label: item.specific_label ?? specificTag?.replace('specific:', '') ?? item.clothing_type,
      primary_category: item.primary_category ?? categoryTag?.replace('category:', '') ?? item.clothing_type,
    }
  }

  const fetchItems = useCallback(async () => {
    if (!userId) { setItems([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      setItems((data ?? []).map(item => hydrateItem(item as WardrobeItemRow)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function addItem(item: Omit<WardrobeItemRow, 'id' | 'created_at'>) {
    const primaryInsert = {
      ...item,
      primary_category: item.primary_category ?? item.clothing_type,
      specific_label: item.specific_label ?? item.clothing_type,
    }

    let data: WardrobeItemRow | null = null
    let error: { message: string } | null = null

    const primaryResult = await supabase
      .from('wardrobe_items')
      .insert(primaryInsert)
      .select()
      .single()

    data = primaryResult.data as WardrobeItemRow | null
    error = primaryResult.error

    if (error?.message?.includes('specific_label') || error?.message?.includes('primary_category')) {
      const legacyResult = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: item.user_id,
          photo_url: item.photo_url,
          clothing_type: item.clothing_type,
          colors: item.colors,
          formality: item.formality,
          pattern: item.pattern,
          season: item.season,
          tags: [
            ...(item.tags ?? []),
            `specific:${item.specific_label ?? item.clothing_type}`,
            `category:${item.primary_category ?? item.clothing_type}`,
          ],
        })
        .select()
        .single()

      data = legacyResult.data as WardrobeItemRow | null
      error = legacyResult.error
    }

    if (error) throw new Error(error.message)
    if (!data) throw new Error('Could not save item.')
    const hydratedItem = hydrateItem(data)
    setItems(prev => [hydratedItem, ...prev])
    return hydratedItem
  }

  async function deleteItem(id: string) {
    if (!userId) throw new Error('You must be signed in to delete wardrobe items.')

    const { data, error } = await supabase
      .from('wardrobe_items')
      .delete()
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    if (!data || data.length === 0) {
      await fetchItems()
      throw new Error('Item was not deleted. Check your Supabase RLS policies and confirm the item belongs to the signed-in user.')
    }

    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, loading, error, refetch: fetchItems, addItem, deleteItem }
}

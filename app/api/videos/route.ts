import { NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

function findMp4Files(dir: string): string[] {
  const results: string[] = []
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      const inner = findMp4Files(full)
      inner.forEach(i => results.push(i))
    } else if (st.isFile() && entry.toLowerCase().endsWith('.mp4')) {
      // Return path relative to public (to be used as /<path>)
      results.push('/' + relative(join(process.cwd(), 'public'), full).replace(/\\/g, '/'))
    }
  }
  return results
}

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public')
    const files = findMp4Files(publicDir)
    return NextResponse.json({ videos: files })
  } catch (err) {
    console.error('Error listing videos:', err)
    return NextResponse.json({ videos: [] })
  }
}

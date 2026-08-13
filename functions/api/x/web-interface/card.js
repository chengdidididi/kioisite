export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  }

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(context.request.url)
  const mid = url.searchParams.get('mid')

  if (!mid) {
    return new Response(JSON.stringify({ code: -1, message: '缺少 mid 参数' }), {
      status: 400,
      headers: corsHeaders
    })
  }

  // 转发到 B站 API
  const apiUrl = `https://api.bilibili.com/x/web-interface/card?mid=${mid}`
  const resp = await fetch(apiUrl, {
    headers: {
      'Referer': 'https://www.bilibili.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  const data = await resp.text()
  return new Response(data, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=300'
    }
  })
}
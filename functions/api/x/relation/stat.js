const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=300'
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders
  })
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: responseHeaders })
  }

  if (context.request.method !== 'GET') {
    return jsonResponse({ code: -1, message: '仅支持 GET 请求' }, 405)
  }

  const requestUrl = new URL(context.request.url)
  const vmid = requestUrl.searchParams.get('vmid')

  if (!vmid || !/^\d+$/.test(vmid)) {
    return jsonResponse({ code: -1, message: 'vmid 参数无效' }, 400)
  }

  const upstreamUrl = `https://api.bilibili.com/x/relation/stat?vmid=${vmid}`

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Referer: 'https://www.bilibili.com/',
        Origin: 'https://www.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    })

    const contentType = upstream.headers.get('content-type') || ''
    const rawBody = await upstream.text()

    if (!upstream.ok || !contentType.includes('application/json')) {
      return jsonResponse({
        code: -2,
        message: 'B站上游返回了非 JSON 响应',
        upstreamStatus: upstream.status,
        upstreamContentType: contentType,
        upstreamPreview: rawBody.slice(0, 200)
      }, 502)
    }

    let upstreamData
    try {
      upstreamData = JSON.parse(rawBody)
    } catch {
      return jsonResponse({
        code: -3,
        message: 'B站上游 JSON 解析失败',
        upstreamPreview: rawBody.slice(0, 200)
      }, 502)
    }

    if (upstreamData.code !== 0 || !upstreamData.data) {
      return jsonResponse({
        code: upstreamData.code ?? -4,
        message: upstreamData.message || 'B站接口返回异常'
      }, 502)
    }

    return jsonResponse({
      code: 0,
      message: 'OK',
      data: {
        follower: upstreamData.data.follower
      }
    })
  } catch (error) {
    return jsonResponse({
      code: -5,
      message: '请求 B站接口失败',
      detail: error instanceof Error ? error.message : String(error)
    }, 502)
  }
}
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request adding CORS headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->corsHeaders());
        }

        /** @var Response $response */
        $response = $next($request);
        foreach ($this->corsHeaders() as $k => $v) {
            $response->headers->set($k, $v);
        }
        return $response;
    }

    private function corsHeaders(): array
    {
        $origin = request()->headers->get('Origin', '*');
        return [
            'Access-Control-Allow-Origin' => $origin,
            'Vary' => 'Origin',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Origin, Content-Type, Accept, Authorization, X-Requested-With',
            'Access-Control-Max-Age' => '86400',
        ];
    }
}

import {NextRequest,NextResponse} from 'next/server';
// Keep legacy endpoints in source for rollback, but never expose them through the rebuilt product.
export function proxy(request:NextRequest) {
 if(!request.nextUrl.pathname.startsWith('/api/shoot/'))return NextResponse.json({error:'LEGACY_ENDPOINT_DISABLED',message:'请使用新版摄影棚。'},{status:410,headers:{'Cache-Control':'no-store'}});
 return NextResponse.next();
}
export const config={matcher:'/api/:path*'};

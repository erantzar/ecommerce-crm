'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { fetchProductById } from '@/features/products/store/productsThunks';
import { selectSelectedProduct, selectProductDetailStatus } from '@/features/products/store/productsSelectors';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductReviews from '@/features/products/components/ProductReviews';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectSelectedProduct);
  const status = useAppSelector(selectProductDetailStatus);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-muted-foreground">Product not found.</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/products" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">{product.name}</h1>
        <Badge variant="secondary" className="capitalize">{product.category}</Badge>
        {product.isActive === false && <Badge variant="destructive">Inactive</Badge>}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Images */}
          {product.images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {product.images.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                  priority={i === 0}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stock</p>
              <p className="font-semibold text-lg">{product.stock}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sold</p>
              <p className="font-semibold">{product.sold ?? 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rating</p>
              <p className="font-semibold">{product.averageRating?.toFixed(1) ?? 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-1">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>
        </CardContent>
      </Card>

      <ProductReviews
        productId={product._id}
        ratings={product.ratings ?? []}
        onDeleted={() => dispatch(fetchProductById(id))}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { productsService } from '@/features/products/services/productsService';
import { parseApiError } from '@/core/http/apiError';
import type { ProductRating } from '@/types';

interface Props {
  productId: string;
  ratings: ProductRating[];
  onDeleted: () => void; // parent refetches after delete
}

function getReviewerName(user: ProductRating['user']): string {
  if (typeof user === 'object' && user !== null && 'name' in user) {
    return user.name;
  }
  return 'Unknown user';
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-muted-foreground/40">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProductReviews({ productId, ratings, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(ratingId: string) {
    setDeletingId(ratingId);
    try {
      await productsService.deleteRating(productId, ratingId);
      toast.success('Review deleted');
      onDeleted();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Customer Reviews
          <Badge variant="secondary">{ratings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="divide-y">
            {ratings.map((review) => (
              <div key={review._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">
                        {getReviewerName(review.user)}
                      </span>
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={deletingId === review._id}
                    onClick={() => handleDelete(review._id)}
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

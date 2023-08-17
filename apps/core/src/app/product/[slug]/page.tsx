import { Button } from '@bigcommerce/reactant/Button';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';
import { Heart } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import client from '~/client';
import { assertNonNullable } from '~/utils';

import { AddToCart } from './AddToCart';
import { BreadCrumbs } from './Breadcrumbs';
import { Gallery } from './Gallery';
import { ProductForm } from './ProductForm';
import { Reviews } from './Reviews';
import { ReviewSummary } from './ReviewSummary';
import { VariantSelector } from './VariantSelector';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ProductDetails = ({
  product,
}: {
  product: Awaited<ReturnType<typeof client.getProduct>>;
}) => {
  const reviewSectionId = 'write-a-review';

  assertNonNullable(product);

  return (
    <div>
      {product.brand && (
        <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
      )}

      <h1 className="mb-4 text-h2">{product.name}</h1>

      <Suspense fallback="Loading...">
        <ReviewSummary productId={product.entityId} reviewSectionId={reviewSectionId} />
      </Suspense>

      {product.prices && (
        <div className="my-6">
          <p className="text-h4">{currencyFormatter.format(product.prices.price.value)}</p>
        </div>
      )}

      <ProductForm>
        <input name="product_id" type="hidden" value={product.entityId} />

        <VariantSelector product={product} />

        <div className="sm:w-[120px]">
          <Label className="my-2 inline-block font-semibold" htmlFor="quantity">
            Quantity
          </Label>
          <Counter id="quantity" name="quantity" />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <AddToCart disabled={product.availabilityV2.status === 'Unavailable'} />

          {/* NOT IMPLEMENTED YET */}
          <div className="w-full">
            <Button disabled type="submit" variant="secondary">
              <Heart aria-hidden="true" className="mx-2" />
              <span>Save to wishlist</span>
            </Button>
          </div>
        </div>
      </ProductForm>

      <div className="my-12">
        <h2 className="mb-4 text-h5">Additional details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Boolean(product.sku) && (
            <div>
              <h3 className="text-base font-bold">SKU</h3>
              <p>{product.sku}</p>
            </div>
          )}
          {Boolean(product.upc) && (
            <div>
              <h3 className="text-base font-bold">UPC</h3>
              <p>{product.upc}</p>
            </div>
          )}
          {Boolean(product.minPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Minimum purchase</h3>
              <p>{product.minPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.maxPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Maxiumum purchase</h3>
              <p>{product.maxPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.availabilityV2.description) && (
            <div>
              <h3 className="text-base font-bold">Availability</h3>
              <p>{product.availabilityV2.description}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="text-base font-bold">Condition</h3>
              <p>{product.condition}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDescriptionAndReviews = ({
  product,
}: {
  product: Awaited<ReturnType<typeof client.getProduct>>;
}) => {
  assertNonNullable(product);

  const reviewSectionId = 'write-a-review';

  return (
    <div className="lg:col-span-2">
      {Boolean(product.plainTextDescription) && (
        <>
          <h2 className="mb-4 text-h5">Description</h2>
          <p>{product.plainTextDescription}</p>
        </>
      )}

      {Boolean(product.warranty) && (
        <>
          <h2 className="mb-4 mt-8 text-h5">Warranty</h2>
          <p>{product.warranty}</p>
        </>
      )}

      <Suspense fallback="Loading...">
        <Reviews productId={product.entityId} reviewSectionId={reviewSectionId} />
      </Suspense>
    </div>
  );
};

export default async function Product({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const productId = Number(params.slug);
  const { slug, ...options } = searchParams;

  const optionValueIds = Object.keys(options).map((option) => ({
    optionEntityId: Number(option),
    valueEntityId: Number(searchParams[option]),
  }));

  const product = await client.getProduct({ productId, optionValueIds });

  if (!product) {
    return notFound();
  }

  return (
    <>
      <BreadCrumbs productId={productId} />
      <div className="mt-4 mb-12 lg:grid lg:grid-cols-2 lg:gap-8">
        <Gallery product={product} />
        <ProductDetails product={product} />
        <ProductDescriptionAndReviews product={product} />
      </div>
    </>
  );
}

export const runtime = 'edge';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingListItem from './ShippingListItem';

export default function RecentShippingList({ deliveries }) {
  const navigate = useNavigate();

  return (
    <div className="px-6 mb-8">
      <h3 className="font-bold mb-4 text-[15px] text-white tracking-wide">Recent Shipping</h3>
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <ShippingListItem
              key={delivery.id}
              trackingId={delivery.id}
              origin={delivery.origin}
              destination={delivery.destination}
              onClick={() => navigate(`/tracking-active?id=${delivery.id}`)}
            />
          ))
        ) : (
          <div className="p-6 text-center text-textGray text-sm">
            No recent shipments found.
          </div>
        )}
      </div>
    </div>
  );
}
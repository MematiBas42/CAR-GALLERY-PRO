import React from 'react'
import { getComingSoonCars } from '@/app/_actions/car';
import { ComingSoonCarousel } from './ComingSoonCarousel';

const ComingSoon = async () => {
    const cars = await getComingSoonCars();

    if (cars.length === 0) return null;

    return (
        <section className="pt-24 pb-0 bg-linear-to-b from-background to-secondary/20 border-t border-white/5">
			<div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">
                        Özenle seçtiğimiz araçları sizler için hazırlıyoruz
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Çok yakında envanterimizde yerini alacak özel araçlara ilk göz atan siz olun.
                    </p>
                </div>
                
                <ComingSoonCarousel cars={cars} />
			</div>
		</section>
    )
}

export default ComingSoon;

import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function smoothScroll(element: HTMLElement, amount: number, duration: number = 800) {
  if (element.dataset.animating) return;
  element.dataset.animating = "true";
  
  // Temporarily disable CSS snapping to allow our custom smooth animation
  element.style.scrollSnapType = 'none';
  
  const start = element.scrollLeft;
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // easeInOutCubic for a very soft, premium feel
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    element.scrollLeft = start + (amount * ease);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      element.style.scrollSnapType = 'x mandatory';
      delete element.dataset.animating;
    }
  };

  requestAnimationFrame(animateScroll);
}

export interface InfiniteSliderSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  exploreLink: string;
  exploreText: string;
}

export function InfiniteSliderSection<T>({
  title,
  items,
  renderItem,
  exploreLink,
  exploreText
}: InfiniteSliderSectionProps<T>) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHovered = useRef(false)

  // Duplicate items for continuous infinite scroll
  const extendedItems = [...items, ...items, ...items, ...items]

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const cardEl = el.children[0] as HTMLElement;
      const gap = window.innerWidth >= 768 ? 24 : 16;
      const scrollAmount = cardEl.offsetWidth + gap;
      
      smoothScroll(el, direction === 'left' ? -scrollAmount : scrollAmount, 800);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const singleSetWidth = el.scrollWidth / 4;
      
      // Infinite loop jumps
      if (el.scrollLeft >= singleSetWidth * 3) {
        el.scrollLeft = el.scrollLeft - singleSetWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft = singleSetWidth;
      }
    };

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      // Start at the second set to allow scrolling left
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 4;
        }
      }, 100);
    }
    
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && !isHovered.current) {
        const el = scrollRef.current;
        const cardEl = el.children[0] as HTMLElement;
        const gap = window.innerWidth >= 768 ? 24 : 16;
        const scrollAmount = cardEl.offsetWidth + gap;
        
        smoothScroll(el, scrollAmount, 800);
      }
    }, 4000); // Slide every 4 seconds for a more relaxed pace

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start">
      <h2 className="text-2xl md:text-4xl font-bold text-brand mb-8">
        {title}
      </h2>
      
      <Card className="border-none shadow-[0_0_25px_rgba(0,0,0,0.08)] p-4 md:p-6 rounded-2xl relative bg-background">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => isHovered.current = true}
          onMouseLeave={() => isHovered.current = false}
        >
          {extendedItems.map((item, index) => renderItem(item, index))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button 
            onClick={() => navigate(exploreLink)} 
            className="bg-brand hover:bg-brand/90 text-white rounded-lg px-6 font-bold text-[16px]"
          >
            {exploreText}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              size="icon" 
              aria-label="Previous"
              onClick={() => scroll('left')}
              className="bg-brand text-white hover:bg-brand/90 w-10 h-10 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              aria-label="Next"
              onClick={() => scroll('right')}
              className="bg-brand text-white hover:bg-brand/90 w-10 h-10 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}

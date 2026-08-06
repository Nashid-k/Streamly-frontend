import { Metadata } from 'next';
import { fetchMovieById } from '../../../../lib/api';
import WatchClient from './WatchClient';

export async function generateMetadata({ params }: { params: { platform: string, id: string } }): Promise<Metadata> {
  try {
    const movie = await fetchMovieById(params.id, params.platform);
    if (!movie) return { title: 'Not Found' };
    
    return {
      title: `${movie.title} - Watch on Streamly`,
      description: movie.description || 'Watch instantly on Streamly.',
      openGraph: {
        title: `${movie.title} - Watch on Streamly`,
        description: movie.description,
        images: movie.backdropUrl || movie.posterUrl ? [movie.backdropUrl || movie.posterUrl] : [],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${movie.title} - Watch on Streamly`,
        description: movie.description,
        images: movie.backdropUrl || movie.posterUrl ? [movie.backdropUrl || movie.posterUrl] : [],
      }
    };
  } catch (e) {
    return { title: 'Watch on Streamly' };
  }
}

export default function WatchPage({ params }: { params: { platform: string, id: string } }) {
  return <WatchClient platform={params.platform} id={params.id} />;
}

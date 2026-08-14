import Hero from './components/Hero';
import MusicPlayer from './components/MusicPlayer';
import Timeline from './components/Timeline';
import PhotoGallery from './components/PhotoGallery';
import NameStory from './components/NameStory';
import BirthdayMessage from './components/BirthdayMessage';
import BirthdayCelebration from './components/BirthdayCelebration';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import BackgroundCrackers from './components/BackgroundCrackers';
import ImageProtection from './components/ImageProtection';

export default function Home() {
  return (
    <main className="main-wrapper">
      <ImageProtection />
      <CustomCursor />
      <ScrollProgress />
      <MusicPlayer />
      <BackgroundCrackers />

      <Hero />
      <Timeline />
      <PhotoGallery />
      <NameStory />
      <BirthdayMessage />
      <BirthdayCelebration />
      <Footer />
    </main>
  );
}

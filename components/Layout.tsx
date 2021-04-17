import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ImageArea from './ImageArea/ImageArea';
import NavBar from './NavBar';
import SearchBar from './SearchBar';
import VoiceArea from './VoiceArea/VoiceArea';

const Layout: React.FC = ({ children }) => {
  const router = useRouter();
  const initialKeyword = router.pathname === '/results/[keyword]' ? router.asPath.split('/')[2] : '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [image, setImage] = useState<File | null>(null);
  const [showImageArea, setShowImageArea] = useState(false);
  const [showVoiceArea, setShowVoiceArea] = useState(false);

  return (
    <div>
      <Head>
        <title>Chie</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="md:px-72 px-2">
        <NavBar />

        <SearchBar
          keyword={keyword}
          setKeyword={setKeyword}
          setShowImageArea={setShowImageArea}
          setShowVoiceArea={setShowVoiceArea}
        />
        {showImageArea && <ImageArea image={image} setImage={setImage} setKeyword={setKeyword} />}
        {showVoiceArea && <VoiceArea />}

        {children}
      </main>
    </div>
  );
};

export default Layout;

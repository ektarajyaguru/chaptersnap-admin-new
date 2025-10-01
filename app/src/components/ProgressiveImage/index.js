import React, { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

const ProgressiveImage = ({ src, defaultImageSource, style, ...rest }) => {
  const defaultImage = defaultImageSource
    ? defaultImageSource
    : require("assets/img/bookCoverPlaceholder.png");

  // const [dummyimgUrl, setdummyImgUrl] = useState(false);
  // console.log(dummyimgUrl);

  // const base64 = () => {
  //   fetch(
  //     "https://firebasestorage.googleapis.com/v0/b/chaptersnap-5f837.appspot.com/o/banners%2Fniko-photos-tGTVxeOr_Rs-unsplash.jpg?alt=media&token=e288cdd8-38c5-442c-adfe-0dc51e1763b4"
  //   )
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(blob);
  //       return new Promise((res) => {
  //         reader.onloadend = () => {
  //           res(reader.result);
  //           setdummyImgUrl(reader.result);
  //         };
  //       });
  //     });
  // };

  // useEffect(() => {
  //   base64();
  // }, []);

  const [imgUrl, setImgUrl] = useState(false);
  const supabase = createClient();
  const storageBucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";

  const loadImage = async () => {
    if (src) {
      if (src.startsWith("https://") || src.startsWith("file://")) {
        setImgUrl(src);
      } else {
        try {
          const cachedImage = localStorage.getItem(src);
          if (cachedImage) {
            setImgUrl(cachedImage);
          } else {
            const { data } = supabase.storage
              .from(storageBucket)
              .getPublicUrl(src);
            const publicUrl = data?.publicUrl;
            if (publicUrl) {
              setImgUrl(publicUrl);
              localStorage.setItem(src, publicUrl);
            }
          }
        } catch (error) {
          console.error("Error loading image:", error);
        }
      }
    }
  };

  useEffect(() => {
    loadImage();
  }, [src]);

  return (
    <img
      {...rest}
      style={style}
      src={imgUrl ? imgUrl : defaultImage} //show as base64
      alt="Book Thumbnail"
    />
  );
};

export default ProgressiveImage;

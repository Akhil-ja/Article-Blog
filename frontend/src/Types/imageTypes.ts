export interface Image {
  _id: string;
  url: string;
  title: string;
}

export interface UploadImageData {
  files: File[];
  titles: string[];
}

export interface UpdateImageData {
  id: string;
  imageData: {
    title: string;
    url?: string;
  };
}

export interface RearrangedImageOrder {
  imageOrders: { _id: string; order: number }[];
}

export interface ImageState {
  images: Image[];
  loading: boolean;
  error: string | null;
}

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes?: NFTAttribute[];
  }
  
  export interface NFTAttribute {
    trait_type: string;
    value: string | number;
  }
  
  export interface NFT {
    id: number;
    tokenURI: string;
    metadata: NFTMetadata;
    owner: string;
    creator: string;
  }
  
  export interface FileWithPreview extends File {
    preview: string;
  }
  
  export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    isDuplicate?: boolean;
  }
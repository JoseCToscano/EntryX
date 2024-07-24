export interface Albums {
  name: string;
  artist: string;
  cover: string;
  attendance: number;
  capacity: number;
  venue: string;
  date: Date;
  revenue: number;
}

export const listenNowAlbums: Albums[] = [
  {
    name: "React Rendezvous",
    artist: "Ethan Byte",
    attendance: 1300,
    capacity: 2000,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=300&dpr=2&q=80",
  },
  {
    name: "Async Awakenings",
    artist: "Nina Netcode",
    attendance: 1900,
    capacity: 2000,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1468817814611-b7edf94b5d60?w=300&dpr=2&q=80",
  },
  {
    name: "The Art of Reusability",
    artist: "Lena Logic",
    attendance: 500,
    capacity: 500,
    revenue: 1300,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1528143358888-6d3c7f67bd5d?w=300&dpr=2&q=80",
  },
  {
    name: "Stateful Symphony",
    artist: "Beth Binary",
    attendance: 12500,
    capacity: 19500,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1490300472339-79e4adc6be4a?w=300&dpr=2&q=80",
  },
];

export const madeForYouAlbums: Albums[] = [
  {
    name: "Thinking Components",
    artist: "Lena Logic",
    attendance: 600,
    capacity: 800,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1615247001958-f4bc92fa6a4a?w=300&dpr=2&q=80",
  },
  {
    name: "Functional Fury",
    artist: "Beth Binary",
    attendance: 400,
    capacity: 1600,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1513745405825-efaf9a49315f?w=300&dpr=2&q=80",
  },
  {
    name: "React Rendezvous",
    artist: "Ethan Byte",
    attendance: 200,
    capacity: 310,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=300&dpr=2&q=80",
  },
  {
    name: "Stateful Symphony",
    artist: "Beth Binary",
    attendance: 900,
    capacity: 2000,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1446185250204-f94591f7d702?w=300&dpr=2&q=80",
  },
  {
    name: "Async Awakenings",
    artist: "Nina Netcode",
    attendance: 3000,
    capacity: 5000,
    revenue: 100000,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1468817814611-b7edf94b5d60?w=300&dpr=2&q=80",
  },
  {
    name: "The Art of Reusability",
    artist: "Lena Logic",
    attendance: 1000,
    capacity: 1200,
    revenue: 1200,
    venue: "C3 Stage",
    date: new Date("2024-05-01"),
    cover:
      "https://images.unsplash.com/photo-1490300472339-79e4adc6be4a?w=300&dpr=2&q=80",
  },
];

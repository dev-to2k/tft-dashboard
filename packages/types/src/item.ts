export interface TftItem {
  id: string;
  slug: string;
  name: string;
  iconUrl: string;
  components: [string, string] | [];
  description: string;
}

export interface CoordsProps {
  node: string
  coords: {
    latitude: number
    longitude: number
    accuracy?: number
  }
}

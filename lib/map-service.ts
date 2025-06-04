// 쓰레기통 데이터 타입 정의
export interface TrashBin {
  id: string
  name: string
  address: string
  capacity: number
  type: string
  distance: string
  lat: number
  lng: number
  region?: string // 지역 정보 추가
}

// 샘플 쓰레기통 데이터
export const trashBins: TrashBin[] = [
  // 강남 지역 데이터
  {
    id: "1",
    name: "강남역 1번 출구",
    address: "서울시 강남구 강남대로 지하 396",
    capacity: 75,
    type: "일반쓰레기",
    distance: "50m",
    lat: 37.498095,
    lng: 127.02761,
    region: "gangnam",
  },
  {
    id: "2",
    name: "강남역 2번 출구",
    address: "서울시 강남구 강남대로 지하 396",
    capacity: 30,
    type: "재활용",
    distance: "120m",
    lat: 37.498485,
    lng: 127.028379,
    region: "gangnam",
  },
  {
    id: "3",
    name: "강남역 광장",
    address: "서울시 강남구 강남대로 396",
    capacity: 90,
    type: "일반쓰레기",
    distance: "200m",
    lat: 37.497695,
    lng: 127.027764,
    region: "gangnam",
  },
  {
    id: "4",
    name: "강남역 버스정류장",
    address: "서울시 강남구 강남대로 390",
    capacity: 15,
    type: "재활용",
    distance: "300m",
    lat: 37.496695,
    lng: 127.026764,
    region: "gangnam",
  },
  {
    id: "5",
    name: "신논현역 1번 출구",
    address: "서울시 강남구 봉은사로 102",
    capacity: 45,
    type: "일반쓰레기",
    distance: "500m",
    lat: 37.504395,
    lng: 127.025364,
    region: "gangnam",
  },
  {
    id: "6",
    name: "신논현역 2번 출구",
    address: "서울시 강남구 봉은사로 102",
    capacity: 60,
    type: "재활용",
    distance: "550m",
    lat: 37.504695,
    lng: 127.025764,
    region: "gangnam",
  },

  // 부산 서면 지역 데이터 추가
  {
    id: "7",
    name: "서면역 1번 출구",
    address: "부산광역시 부산진구 중앙대로 지하 730",
    capacity: 85,
    type: "일반쓰레기",
    distance: "50m",
    lat: 35.15799,
    lng: 129.059307,
    region: "seomyeon",
  },
  {
    id: "8",
    name: "서면역 2번 출구",
    address: "부산광역시 부산진구 중앙대로 지하 730",
    capacity: 40,
    type: "재활용",
    distance: "80m",
    lat: 35.15829,
    lng: 129.059507,
    region: "seomyeon",
  },
  {
    id: "9",
    name: "서면 롯데백화점 앞",
    address: "부산광역시 부산진구 가야대로 772",
    capacity: 65,
    type: "일반쓰레기",
    distance: "150m",
    lat: 35.15689,
    lng: 129.057907,
    region: "seomyeon",
  },
  {
    id: "10",
    name: "서면 지하상가 입구",
    address: "부산광역시 부산진구 중앙대로 지하 672",
    capacity: 25,
    type: "재활용",
    distance: "200m",
    lat: 35.15929,
    lng: 129.058507,
    region: "seomyeon",
  },
  {
    id: "11",
    name: "부산진구청 앞",
    address: "부산광역시 부산진구 시민공원로 30",
    capacity: 50,
    type: "일반쓰레기",
    distance: "350m",
    lat: 35.16129,
    lng: 129.055507,
    region: "seomyeon",
  },
  {
    id: "12",
    name: "NC백화점 서면점",
    address: "부산광역시 부산진구 서면로 56",
    capacity: 70,
    type: "재활용",
    distance: "280m",
    lat: 35.15529,
    lng: 129.060507,
    region: "seomyeon",
  },
]

// 지역별 기본 좌표
export const defaultLocations = {
  gangnam: { lat: 37.498095, lng: 127.02761 },
  seomyeon: { lat: 35.15799, lng: 129.059307 },
}

// 거리 계산 함수 (하버사인 공식)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // 지구 반경 (미터)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 미터 단위 거리
}

// 거리에 따라 가까운 쓰레기통 찾기
export function findNearbyTrashBins(lat: number, lng: number, maxDistance = 1000, region?: string): TrashBin[] {
  let filteredBins = trashBins

  // 지역 필터링이 있으면 적용
  if (region) {
    filteredBins = trashBins.filter((bin) => bin.region === region)
  }

  return filteredBins
    .map((bin) => {
      const distance = calculateDistance(lat, lng, bin.lat, bin.lng)
      return {
        ...bin,
        distance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`,
      }
    })
    .filter((bin) => calculateDistance(lat, lng, bin.lat, bin.lng) <= maxDistance)
    .sort((a, b) => {
      const distA = parseDistanceValue(a.distance)
      const distB = parseDistanceValue(b.distance)
      return distA - distB
    })
}

// 거리 문자열에서 숫자 값 추출 (예: "50m" -> 50, "1.2km" -> 1200)
export function parseDistanceValue(distance: string): number {
  if (distance.includes("km")) {
    return Number.parseFloat(distance.replace("km", "")) * 1000
  }
  return Number.parseFloat(distance.replace("m", ""))
}

// 용량에 따른 색상 반환
export function getCapacityColor(capacity: number): string {
  if (capacity >= 80) return "text-red-500"
  if (capacity >= 50) return "text-yellow-500"
  return "text-green-500"
}

export function getCapacityBgColor(capacity: number): string {
  if (capacity >= 80) return "bg-red-100"
  if (capacity >= 50) return "bg-yellow-100"
  return "bg-green-100"
}

// 마커 이미지 URL 반환
export function getMarkerImageByCapacity(capacity: number): string {
  if (capacity >= 80) return "/marker-red.png"
  if (capacity >= 50) return "/marker-yellow.png"
  return "/marker-green.png"
}

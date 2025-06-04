"use client"

import { useEffect, useRef, useState } from "react"
import { type TrashBin, getCapacityColor, getCapacityBgColor, defaultLocations } from "@/lib/map-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Navigation, X, MapPin } from "lucide-react"
import Image from "next/image"

declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  trashBins: TrashBin[]
  onSelectBin?: (bin: TrashBin | null) => void
  onSaveLocation?: (bin: TrashBin) => void
  height?: string
  region?: string
}

export default function KakaoMap({
  trashBins,
  onSelectBin,
  onSaveLocation,
  height = "400px",
  region = "gangnam",
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [apiLoaded, setApiLoaded] = useState<boolean | null>(null)
  const [fallbackImageShown, setFallbackImageShown] = useState(false)

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return

    const loadMap = () => {
      // API 로드 상태 확인 타이머
      const apiCheckTimeout = setTimeout(() => {
        if (typeof window.kakao === "undefined") {
          console.log("카카오맵 API 로드 실패, 대체 이미지 사용")
          setApiLoaded(false)
          setIsLoading(false)
          setFallbackImageShown(true)
          return
        }
      }, 3000) // 3초 후에도 API가 로드되지 않으면 fallback 사용

      if (typeof window.kakao === "undefined") {
        // 카카오맵 API가 로드되지 않았을 경우 1초 후 재시도
        setTimeout(loadMap, 1000)
        return
      }

      // API가 로드되었으면 타이머 취소
      clearTimeout(apiCheckTimeout)
      setApiLoaded(true)
      setIsLoading(true)

      // 기본 위치 (선택된 지역에 따라)
      const defaultLat = defaultLocations[region as keyof typeof defaultLocations]?.lat || 37.498095
      const defaultLng = defaultLocations[region as keyof typeof defaultLocations]?.lng || 127.02761

      // 지도 생성
      const options = {
        center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
        level: 3,
      }

      const mapInstance = new window.kakao.maps.Map(mapRef.current, options)
      setMap(mapInstance)

      // 사용자 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })

          // 사용자 위치 마커 추가
          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
            map: mapInstance,
          })

          // 사용자 위치로 지도 이동
          mapInstance.setCenter(new window.kakao.maps.LatLng(lat, lng))
        },
        (error) => {
          console.error("위치 정보를 가져오는데 실패했습니다:", error)
          setUserLocation({ lat: defaultLat, lng: defaultLng })
        },
        { enableHighAccuracy: true },
      )

      // 지도 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl()
      mapInstance.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

      setIsLoading(false)
    }

    loadMap()

    return () => {
      // 마커 및 지도 정리
      if (markers.length > 0) {
        markers.forEach((marker) => marker.setMap(null))
      }
    }
  }, [region])

  // 쓰레기통 마커 추가
  useEffect(() => {
    if (!map || !trashBins.length || !apiLoaded) return

    // 기존 마커 제거
    if (markers.length > 0) {
      markers.forEach((marker) => marker.setMap(null))
    }

    // 새 마커 생성
    const newMarkers = trashBins.map((bin) => {
      // 마커 이미지 설정
      let markerImageSrc
      if (bin.capacity >= 80) {
        markerImageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
      } else if (bin.capacity >= 50) {
        markerImageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_yellow.png"
      } else {
        markerImageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_green.png"
      }

      const imageSize = new window.kakao.maps.Size(24, 35)
      const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize)

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(bin.lat, bin.lng),
        map: map,
        title: bin.name,
        image: markerImage,
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", () => {
        setSelectedBin(bin)
        if (onSelectBin) onSelectBin(bin)
      })

      return marker
    })

    setMarkers(newMarkers)
  }, [map, trashBins, onSelectBin, apiLoaded])

  // 선택된 쓰레기통으로 지도 이동
  useEffect(() => {
    if (!map || !selectedBin || !apiLoaded) return

    const moveLatLon = new window.kakao.maps.LatLng(selectedBin.lat, selectedBin.lng)
    map.panTo(moveLatLon)
  }, [map, selectedBin, apiLoaded])

  // 길찾기 함수
  const handleFindRoute = () => {
    if (!selectedBin || !userLocation) return

    // 카카오맵 길찾기 URL 생성
    const { lat, lng } = userLocation
    const { lat: destLat, lng: destLng, name } = selectedBin

    const kakaoMapUrl = `https://map.kakao.com/link/to/${name},${destLat},${destLng}/from/현재위치,${lat},${lng}`
    window.open(kakaoMapUrl, "_blank")
  }

  // Fallback 이미지 사용 시 쓰레기통 위치 클릭 처리
  const handleFallbackMapClick = (bin: TrashBin) => {
    setSelectedBin(bin)
    if (onSelectBin) onSelectBin(bin)
  }

  // API가 로드되지 않았을 때 fallback 이미지 표시
  if (apiLoaded === false || fallbackImageShown) {
    return (
      <div className="relative w-full" style={{ height }}>
        <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-80 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-red-500" />
          {region === "seomyeon" ? "부산 서면" : "서울 강남"}
        </div>

        <div className="relative w-full h-full">
          <Image
            src={region === "seomyeon" ? "/seomyeon-map.png" : "/placeholder.svg?height=400&width=600"}
            alt={`${region === "seomyeon" ? "부산 서면" : "서울 강남"} 지도`}
            fill
            className="object-cover rounded-lg"
          />

          {/* 쓰레기통 위치 마커 */}
          {trashBins.map((bin) => (
            <button
              key={bin.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-white ${
                bin.capacity >= 80 ? "bg-red-500" : bin.capacity >= 50 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{
                top: `${Math.random() * 60 + 20}%`, // 임의의 위치 (실제로는 정확한 좌표 계산 필요)
                left: `${Math.random() * 60 + 20}%`, // 임의의 위치
              }}
              onClick={() => handleFallbackMapClick(bin)}
            >
              <span className="text-white text-xs font-bold">{bin.id}</span>
            </button>
          ))}
        </div>

        {selectedBin && (
          <Card className="absolute bottom-4 left-4 right-4 z-10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{selectedBin.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedBin.address}</p>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{selectedBin.type}</Badge>
                    <span className="text-sm text-gray-500">{selectedBin.distance}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getCapacityColor(selectedBin.capacity)}`}>
                    {selectedBin.capacity}%
                  </div>
                  <div className={`w-16 h-2 rounded-full mt-1 ${getCapacityBgColor(selectedBin.capacity)}`}>
                    <div
                      className={`h-full rounded-full ${
                        selectedBin.capacity >= 80
                          ? "bg-red-500"
                          : selectedBin.capacity >= 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${selectedBin.capacity}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onSaveLocation) onSaveLocation(selectedBin)
                  }}
                >
                  저장하기
                </Button>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleFindRoute} className="bg-green-500 hover:bg-green-600">
                    <Navigation className="w-4 h-4 mr-1" />
                    길찾기
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedBin(null)
                      if (onSelectBin) onSelectBin(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <span className="ml-2 text-green-700">지도를 불러오는 중...</span>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {selectedBin && (
        <Card className="absolute bottom-4 left-4 right-4 z-10 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{selectedBin.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedBin.address}</p>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{selectedBin.type}</Badge>
                  <span className="text-sm text-gray-500">{selectedBin.distance}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getCapacityColor(selectedBin.capacity)}`}>
                  {selectedBin.capacity}%
                </div>
                <div className={`w-16 h-2 rounded-full mt-1 ${getCapacityBgColor(selectedBin.capacity)}`}>
                  <div
                    className={`h-full rounded-full ${
                      selectedBin.capacity >= 80
                        ? "bg-red-500"
                        : selectedBin.capacity >= 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${selectedBin.capacity}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onSaveLocation) onSaveLocation(selectedBin)
                }}
              >
                저장하기
              </Button>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleFindRoute} className="bg-green-500 hover:bg-green-600">
                  <Navigation className="w-4 h-4 mr-1" />
                  길찾기
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedBin(null)
                    if (onSelectBin) onSelectBin(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

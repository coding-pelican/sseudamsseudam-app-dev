"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Recycle,
  Users,
  Search,
  Home,
  List,
  MessageSquare,
  Menu,
  Bell,
  Plus,
  Camera,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Navigation,
  Filter,
  Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import KakaoMap from "@/components/kakao-map"
import {
  type TrashBin,
  trashBins,
  findNearbyTrashBins,
  getCapacityColor,
  getCapacityBgColor,
  defaultLocations,
} from "@/lib/map-service"

type Screen = "splash" | "onboarding" | "auth" | "home" | "search" | "community" | "locations" | "profile"
type Region = "gangnam" | "seomyeon"

interface CommunityPost {
  id: string
  user: string
  avatar: string
  content: string
  image?: string
  likes: number
  comments: number
  time: string
  type: "report" | "info"
}

export default function SseudamSseudamApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<TrashBin | null>(null)
  const [newPost, setNewPost] = useState("")
  const [savedLocations, setSavedLocations] = useState<TrashBin[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyTrashBins, setNearbyTrashBins] = useState<TrashBin[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [currentRegion, setCurrentRegion] = useState<Region>("gangnam")

  const communityPosts: CommunityPost[] = [
    {
      id: "1",
      user: "환경지킬이",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "강남역 3번 출구 근처에 쓰레기가 무단 투기되어 있습니다. 관할 기관에 신고했어요.",
      image: "/placeholder.svg?height=200&width=300",
      likes: 12,
      comments: 3,
      time: "2시간 전",
      type: "report",
    },
    {
      id: "2",
      user: "깨끗한도시",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "플라스틱 분리수거 팁: 라벨을 제거하고 깨끗이 씻어서 배출해주세요! 🌱",
      likes: 25,
      comments: 7,
      time: "5시간 전",
      type: "info",
    },
    {
      id: "3",
      user: "시민참여자",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "우리 동네에 쓰레기통이 부족해요. 증설 요청 어떻게 하나요?",
      likes: 8,
      comments: 12,
      time: "1일 전",
      type: "info",
    },
    {
      id: "4",
      user: "부산청결",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "서면역 주변 쓰레기통이 새로 설치되었습니다! 깨끗한 부산을 위해 함께해요.",
      image: "/placeholder.svg?height=200&width=300",
      likes: 32,
      comments: 5,
      time: "1일 전",
      type: "info",
    },
  ]

  const onboardingSteps = [
    {
      title: "쓰담쓰담에 오신 것을 환영합니다!",
      description: "쓰레기 무단 투기를 예방하고 깨끗한 도시를 만들어가요",
      icon: <Recycle className="w-16 h-16 text-green-500" />,
    },
    {
      title: "실시간 쓰레기통 찾기",
      description: "내 위치 기반으로 가장 가까운 쓰레기통을 찾아드려요",
      icon: <MapPin className="w-16 h-16 text-blue-500" />,
    },
    {
      title: "커뮤니티 참여",
      description: "무단 투기 신고와 환경 정보를 공유해주세요",
      icon: <Users className="w-16 h-16 text-purple-500" />,
    },
  ]

  // 스플래시 화면 타이머
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("onboarding")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  // 사용자 위치 가져오기 - 화면 진입 시에만 실행
  useEffect(() => {
    if (currentScreen === "home" || currentScreen === "search") {
      // 지역 변경으로 인한 것이 아닌 경우에만 위치 정보 요청
      if (userLocation === null) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            setUserLocation({ lat, lng })

            // 근처 쓰레기통 찾기
            const nearby = findNearbyTrashBins(lat, lng, 1000, currentRegion)
            setNearbyTrashBins(nearby)
          },
          (error) => {
            console.error("위치 정보를 가져오는데 실패했습니다:", error)
            // 기본 위치 (선택된 지역에 따라)
            const defaultLat = defaultLocations[currentRegion].lat
            const defaultLng = defaultLocations[currentRegion].lng
            setUserLocation({ lat: defaultLat, lng: defaultLng })

            // 근처 쓰레기통 찾기
            const nearby = findNearbyTrashBins(defaultLat, defaultLng, 1000, currentRegion)
            setNearbyTrashBins(nearby)
          },
          { enableHighAccuracy: true },
        )
      } else {
        // 이미 위치 정보가 있는 경우 현재 지역의 쓰레기통만 업데이트
        const nearby = findNearbyTrashBins(userLocation.lat, userLocation.lng, 1000, currentRegion)
        setNearbyTrashBins(nearby)
      }
    }
  }, [currentScreen]) // currentRegion 의존성 제거

  const handleSaveLocation = (location: TrashBin) => {
    if (!savedLocations.find((l) => l.id === location.id)) {
      setSavedLocations([...savedLocations, location])
    }
  }

  // 지역 변경 처리
  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region)
    setSelectedLocation(null)

    if (userLocation) {
      // 기존 위치 정보가 있으면 그대로 사용하고 해당 지역의 쓰레기통만 필터링
      const nearby = findNearbyTrashBins(userLocation.lat, userLocation.lng, 1000, region)
      setNearbyTrashBins(nearby)
    } else {
      // 위치 정보가 없으면 선택된 지역의 기본 위치 사용
      const defaultLat = defaultLocations[region].lat
      const defaultLng = defaultLocations[region].lng
      setUserLocation({ lat: defaultLat, lng: defaultLng })

      const nearby = findNearbyTrashBins(defaultLat, defaultLng, 1000, region)
      setNearbyTrashBins(nearby)
    }
  }

  // 지역 변경 시 쓰레기통 목록 업데이트
  useEffect(() => {
    if (userLocation && currentRegion) {
      const nearby = findNearbyTrashBins(userLocation.lat, userLocation.lng, 1000, currentRegion)
      setNearbyTrashBins(nearby)
    }
  }, [currentRegion, userLocation])

  // Splash Screen
  if (currentScreen === "splash") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <Recycle className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">쓰담쓰담</h1>
            <p className="text-lg opacity-90">깨끗한 도시를 위한 첫걸음</p>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding Screen
  if (currentScreen === "onboarding") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            {onboardingSteps[onboardingStep].icon}
            <h2 className="text-2xl font-bold mt-6 mb-4">{onboardingSteps[onboardingStep].title}</h2>
            <p className="text-gray-600 text-lg">{onboardingSteps[onboardingStep].description}</p>
          </div>

          <div className="flex space-x-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index === onboardingStep ? "bg-green-500" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {onboardingStep < onboardingSteps.length - 1 ? (
            <Button
              onClick={() => setOnboardingStep(onboardingStep + 1)}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              다음
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setCurrentScreen("auth")
                }}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                로그인 / 회원가입
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoggedIn(false)
                  setCurrentScreen("home")
                }}
                className="w-full"
              >
                둘러보기
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Auth Screen
  if (currentScreen === "auth") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="p-6">
          <Button variant="ghost" onClick={() => setCurrentScreen("onboarding")} className="mb-4">
            ← 뒤로
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="text-center mb-8">
            <Recycle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">쓰담쓰담</h1>
            <p className="text-gray-600">계정으로 더 많은 기능을 이용하세요</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <Input placeholder="이메일" type="email" />
              <Input placeholder="비밀번호" type="password" />
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={() => {
                  setIsLoggedIn(true)
                  setCurrentScreen("home")
                }}
              >
                로그인
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <Input placeholder="이름" />
              <Input placeholder="이메일" type="email" />
              <Input placeholder="비밀번호" type="password" />
              <Input placeholder="비밀번호 확인" type="password" />
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={() => {
                  setIsLoggedIn(true)
                  setCurrentScreen("home")
                }}
              >
                회원가입
              </Button>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            onClick={() => {
              setIsLoggedIn(false)
              setCurrentScreen("home")
            }}
            className="w-full mt-4"
          >
            나중에 하기
          </Button>
        </div>
      </div>
    )
  }

  // Main App Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Recycle className="w-6 h-6 text-green-500" />
          <h1 className="text-lg font-bold">쓰담쓰담</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={currentRegion} onValueChange={(value) => handleRegionChange(value as Region)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gangnam">서울 강남</SelectItem>
              <SelectItem value="seomyeon">부산 서면</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Home Screen */}
        {currentScreen === "home" && (
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="위치 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setCurrentScreen("search")}
              />
            </div>

            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <KakaoMap
                  trashBins={nearbyTrashBins}
                  onSelectBin={setSelectedLocation}
                  onSaveLocation={handleSaveLocation}
                  height="300px"
                  region={currentRegion}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => {
                  if (selectedLocation) {
                    // 카카오맵 길찾기 URL 생성
                    if (userLocation) {
                      const { lat, lng } = userLocation
                      const { lat: destLat, lng: destLng, name } = selectedLocation
                      const kakaoMapUrl = `https://map.kakao.com/link/to/${name},${destLat},${destLng}/from/현재위치,${lat},${lng}`
                      window.open(kakaoMapUrl, "_blank")
                    }
                  } else {
                    setCurrentScreen("search")
                  }
                }}
              >
                <Navigation className="w-5 h-5" />
                <span className="text-sm">길찾기</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => setCurrentScreen("community")}
              >
                <Camera className="w-5 h-5" />
                <span className="text-sm">신고하기</span>
              </Button>
            </div>

            {/* Nearby Trash Bins */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">근처 쓰레기통</h3>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  필터
                </Button>
              </div>

              <div className="space-y-3">
                {nearbyTrashBins.slice(0, 3).map((bin) => (
                  <Card
                    key={bin.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLocation(bin)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{bin.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{bin.address}</p>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{bin.type}</Badge>
                            <span className="text-sm text-gray-500">{bin.distance}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getCapacityColor(bin.capacity)}`}>{bin.capacity}%</div>
                          <div className={`w-16 h-2 rounded-full mt-1 ${getCapacityBgColor(bin.capacity)}`}>
                            <div
                              className={`h-full rounded-full ${
                                bin.capacity >= 80
                                  ? "bg-red-500"
                                  : bin.capacity >= 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${bin.capacity}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Screen */}
        {currentScreen === "search" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")}>
                ←
              </Button>
              <h2 className="text-lg font-semibold">검색</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="주소나 장소명을 입력하세요"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <KakaoMap
                  trashBins={trashBins.filter(
                    (bin) =>
                      bin.region === currentRegion &&
                      (bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        bin.address.toLowerCase().includes(searchQuery.toLowerCase())),
                  )}
                  onSelectBin={setSelectedLocation}
                  onSaveLocation={handleSaveLocation}
                  height="300px"
                  region={currentRegion}
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold">검색 결과</h3>
              {trashBins
                .filter(
                  (bin) =>
                    bin.region === currentRegion &&
                    (bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      bin.address.toLowerCase().includes(searchQuery.toLowerCase())),
                )
                .map((bin) => (
                  <Card
                    key={bin.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLocation(bin)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{bin.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{bin.address}</p>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{bin.type}</Badge>
                            <span className="text-sm text-gray-500">{bin.distance}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getCapacityColor(bin.capacity)}`}>
                              {bin.capacity}%
                            </div>
                            <div className={`w-16 h-2 rounded-full mt-1 ${getCapacityBgColor(bin.capacity)}`}>
                              <div
                                className={`h-full rounded-full ${
                                  bin.capacity >= 80
                                    ? "bg-red-500"
                                    : bin.capacity >= 50
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                                style={{ width: `${bin.capacity}%` }}
                              />
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleSaveLocation(bin)}>
                            <Plus className="w-3 h-3 mr-1" />
                            저장
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Community Screen */}
        {currentScreen === "community" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">커뮤니티</h2>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-1" />
                글쓰기
              </Button>
            </div>

            {/* New Post */}
            <Card>
              <CardContent className="p-4">
                <Textarea
                  placeholder="무단 투기 신고나 환경 정보를 공유해주세요..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      사진
                    </Button>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="카테고리" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="report">신고</SelectItem>
                        <SelectItem value="info">정보</SelectItem>
                        <SelectItem value="request">요청</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{post.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{post.user}</span>
                          <Badge variant={post.type === "report" ? "destructive" : "secondary"} className="text-xs">
                            {post.type === "report" ? "신고" : "정보"}
                          </Badge>
                          <span className="text-xs text-gray-500">{post.time}</span>
                        </div>
                        <p className="text-sm">{post.content}</p>
                      </div>
                    </div>

                    {post.image && (
                      <div className="mb-3">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post image"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-green-500">
                        <Share2 className="w-4 h-4" />
                        <span>공유</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Locations Screen */}
        {currentScreen === "locations" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">저장된 위치</h2>
              <Badge variant="secondary">{savedLocations.length}</Badge>
            </div>

            {/* Map with saved locations */}
            {savedLocations.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <KakaoMap
                    trashBins={savedLocations.filter((bin) => bin.region === currentRegion)}
                    onSelectBin={setSelectedLocation}
                    height="300px"
                    region={currentRegion}
                  />
                </CardContent>
              </Card>
            )}

            {savedLocations.filter((bin) => bin.region === currentRegion).length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">저장된 위치가 없습니다</p>
                <Button onClick={() => setCurrentScreen("search")} className="bg-green-500 hover:bg-green-600">
                  위치 검색하기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLocations
                  .filter((bin) => bin.region === currentRegion)
                  .map((location) => (
                    <Card
                      key={location.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{location.name}</h4>
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">{location.type}</Badge>
                              <span className="text-sm text-gray-500">{location.distance}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getCapacityColor(location.capacity)}`}>
                              {location.capacity}%
                            </div>
                            <div className={`w-16 h-2 rounded-full mt-1 ${getCapacityBgColor(location.capacity)}`}>
                              <div
                                className={`h-full rounded-full ${
                                  location.capacity >= 80
                                    ? "bg-red-500"
                                    : location.capacity >= 50
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                                style={{ width: `${location.capacity}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <Button
            variant={currentScreen === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("home")}
            className="flex flex-col space-y-1 h-auto py-2"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">홈</span>
          </Button>
          <Button
            variant={currentScreen === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("search")}
            className="flex flex-col space-y-1 h-auto py-2"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">검색</span>
          </Button>
          <Button
            variant={currentScreen === "community" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("community")}
            className="flex flex-col space-y-1 h-auto py-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">커뮤니티</span>
          </Button>
          <Button
            variant={currentScreen === "locations" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("locations")}
            className="flex flex-col space-y-1 h-auto py-2"
          >
            <List className="w-5 h-5" />
            <span className="text-xs">저장위치</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

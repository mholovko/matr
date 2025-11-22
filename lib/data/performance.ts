export interface RoomPerformanceData {
    roomId: string
    roomName: string
    metrics: {
        co2: {
            value: number
            unit: string
            status: 'good' | 'moderate' | 'poor'
        }
        airQuality: {
            pm1: number
            pm25: number
            pm10: number
            unit: string
            status: 'good' | 'moderate' | 'poor'
        }
        temperature: {
            value: number
            unit: string
            status: 'good' | 'moderate' | 'poor'
        }
        humidity: {
            value: number
            unit: string
            status: 'good' | 'moderate' | 'poor'
        }
    }
    lastUpdated: string
}

export const roomPerformanceData: RoomPerformanceData[] = [
    {
        roomId: 'living-room',
        roomName: 'Living Room',
        metrics: {
            co2: {
                value: 450,
                unit: 'ppm',
                status: 'good'
            },
            airQuality: {
                pm1: 5,
                pm25: 8,
                pm10: 12,
                unit: 'µg/m³',
                status: 'good'
            },
            temperature: {
                value: 21.5,
                unit: '°C',
                status: 'good'
            },
            humidity: {
                value: 45,
                unit: '%',
                status: 'good'
            }
        },
        lastUpdated: '2025-11-22T10:30:00Z'
    },
    {
        roomId: 'bedroom-1',
        roomName: 'Bedroom 1',
        metrics: {
            co2: {
                value: 680,
                unit: 'ppm',
                status: 'moderate'
            },
            airQuality: {
                pm1: 12,
                pm25: 18,
                pm10: 25,
                unit: 'µg/m³',
                status: 'moderate'
            },
            temperature: {
                value: 19.2,
                unit: '°C',
                status: 'good'
            },
            humidity: {
                value: 52,
                unit: '%',
                status: 'good'
            }
        },
        lastUpdated: '2025-11-22T10:30:00Z'
    },
    {
        roomId: 'kitchen',
        roomName: 'Kitchen',
        metrics: {
            co2: {
                value: 520,
                unit: 'ppm',
                status: 'good'
            },
            airQuality: {
                pm1: 8,
                pm25: 14,
                pm10: 20,
                unit: 'µg/m³',
                status: 'good'
            },
            temperature: {
                value: 22.8,
                unit: '°C',
                status: 'good'
            },
            humidity: {
                value: 48,
                unit: '%',
                status: 'good'
            }
        },
        lastUpdated: '2025-11-22T10:30:00Z'
    },
    {
        roomId: 'bathroom',
        roomName: 'Bathroom',
        metrics: {
            co2: {
                value: 580,
                unit: 'ppm',
                status: 'good'
            },
            airQuality: {
                pm1: 6,
                pm25: 10,
                pm10: 15,
                unit: 'µg/m³',
                status: 'good'
            },
            temperature: {
                value: 20.5,
                unit: '°C',
                status: 'good'
            },
            humidity: {
                value: 65,
                unit: '%',
                status: 'moderate'
            }
        },
        lastUpdated: '2025-11-22T10:30:00Z'
    }
]

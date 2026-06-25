'use client'

import '../../App.scss'
import '../../globals.css'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import AuthRequired from '@/components/auth-required'
import TherapyInsights from './graphs'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-current-user'

import {
  UserCircle,
  Briefcase,
  BrainCircuit,
  ScrollText,
  ShieldCheck,
  FlaskConical,
  HeartPulse,
  Pill,
  Repeat,
  AlertTriangle,
  Puzzle,
  Star,
  FileText,
  ChevronDown,
  Globe,
  Check,
  Search,
  Mail,
} from 'lucide-react'

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'

import { languageOptions } from '@/components/languageOptions'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

/* ---------------- TYPES ---------------- */

interface DataItem {
  label: string
  value: string
}

interface ChartDataItem {
  label: string
  score?: string
  effectiveness?: string
}

interface DataStructure {
  demographics: DataItem[]
  familyEmployment: DataItem[]
  therapyReasons: DataItem[]
  mentalHealthHistory: DataItem[]
  traumaAndAdverseExperiences: DataItem[]
  substanceUse: DataItem[]
  healthAndLifestyle: DataItem[]
  relationshipsAndSocialSupport: DataItem[]
  selfPerceptionData: ChartDataItem[]
  copingStrategies: ChartDataItem[]
  medicalAndMedicationHistory: DataItem[]
  behavioralPatterns: DataItem[]
  riskAssessment: DataItem[]
  psychologicalFormulation: DataItem[]
  strengthsAndResources: DataItem[]
  therapyRecommendations: DataItem[]
}

/* ---------------- MAIN COMPONENT ---------------- */

const KnowAboutMe: React.FC = () => {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()

  const [data, setData] = useState<DataStructure | null>(null)
  const [originalData, setOriginalData] = useState<DataStructure | null>(null)
  const [graphData, setGraphData] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (userLoading || !user) return

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('email', '==', user.email)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          throw new Error('USER_NOT_FOUND')
        }

        const authId = snapshot.docs[0].id

        const userDocRef = doc(db, 'users', authId)
        const userDocSnap = await getDoc(userDocRef)

        if (!userDocSnap.exists()) {
          throw new Error('USER_DOC_MISSING')
        }

        const journalRef = collection(db, 'users', authId, 'journalEntries')
        const journalSnap = await getDocs(journalRef)

        if (journalSnap.empty) {
          throw new Error('JOURNAL_ENTRIES_MISSING')
        }

        const response = await fetch(
          'https://fastapi-backend-370305669096.asia-south1.run.app/getReport',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authId }),
          }
        )

        if (!response.ok) {
          throw new Error(`API_ERROR_${response.status}`)
        }

        const responseData = await response.json()

        setOriginalData(responseData.info)
        setData(responseData.info)
        setGraphData(responseData.graph)
        setLoading(false)
      } catch (err: any) {
        setError(true)
        setLoading(false)

        switch (err.message) {
          case 'USER_NOT_FOUND':
            setErrorMessage('Your user account was not found.')
            break
          case 'USER_DOC_MISSING':
            setErrorMessage('Your user profile is incomplete.')
            break
          case 'JOURNAL_ENTRIES_MISSING':
            setErrorMessage('No journal entries found.')
            break
          default:
            setErrorMessage('Something went wrong. Please try again.')
        }
      }
    }

    fetchData()
  }, [user, userLoading])

  const backgroundStyle =
    'bg-[linear-gradient(135deg,#00ce8d_0%,#00a1e4_100%)] min-h-screen py-12'

  if (loading || userLoading) {
    return (
      <AuthRequired>
        <div className={backgroundStyle}>
          <div className="flex flex-col items-center justify-center h-screen">
            <DotLottieReact
              src="https://lottie.host/00918141-1a56-47ba-8ba8-5c5902aba48b/2jp7AfTff5.lottie"
              loop
              autoplay
              style={{ height: 120 }}
            />
          </div>
        </div>
      </AuthRequired>
    )
  }

  if (error || !data) {
    return (
      <AuthRequired>
        <div className={backgroundStyle}>
          <div className="flex items-center justify-center h-screen text-white">
            {errorMessage}
          </div>
        </div>
      </AuthRequired>
    )
  }

  return (
    <AuthRequired>
      <div className={backgroundStyle}>
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8">
            Persona Dashboard
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data).map(([key, section]) =>
              Array.isArray(section) ? (
                <Section
                  key={key}
                  title={formatTitle(key)}
                  data={section}
                  icon={getSectionIcon(key)}
                />
              ) : null
            )}
          </div>

          {graphData && <TherapyInsights gdata={graphData} />}
        </div>
      </div>
    </AuthRequired>
  )
}

/* ---------------- HELPERS ---------------- */

const Section: React.FC<{
  title: string
  data: DataItem[]
  icon: React.ElementType
}> = ({ title, data, icon: Icon }) => (
  <div className="bg-white rounded-xl p-6">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-red-600 mr-3" />
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {data.map((item, idx) => (
      <div key={idx} className="mb-3">
        <strong>{item.label}</strong>
        <p>{item.value}</p>
      </div>
    ))}
  </div>
)

const formatTitle = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())

const getSectionIcon = (key: string) => {
  const map: Record<string, React.ElementType> = {
    demographics: UserCircle,
    familyEmployment: Briefcase,
    therapyReasons: BrainCircuit,
    mentalHealthHistory: ScrollText,
    traumaAndAdverseExperiences: ShieldCheck,
    substanceUse: FlaskConical,
    healthAndLifestyle: HeartPulse,
    medicalAndMedicationHistory: Pill,
    behavioralPatterns: Repeat,
    riskAssessment: AlertTriangle,
    psychologicalFormulation: Puzzle,
    strengthsAndResources: Star,
    therapyRecommendations: FileText,
  }
  return map[key] || FileText
}

export default function PersonaDashboardPage() {
  return <KnowAboutMe />
}

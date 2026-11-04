import type { Metadata } from 'next'
import { AssessmentFlow } from '@/components/features/assessment/AssessmentFlow'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { ASSESSMENT_QUERY } from '@/lib/sanity/queries'
import type { Assessment } from '@/lib/sanity/types'
import { buildMetadata } from '@/lib/seo'

const getAssessment = () => sanityFetch<Assessment | null>({ query: ASSESSMENT_QUERY, tags: ['assessment'] })

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLayoutData()
  return buildMetadata({ seo: { noIndex: true }, title: 'Assessment', path: '/assessment/questions', settings })
}

/** Static shell: the questions and labels come from the Studio; the flow runs in the browser. */
export default async function AssessmentQuestionsPage() {
  const a = await getAssessment()
  return <AssessmentFlow flow={a?.flow} areas={a?.areas} questions={a?.questions} />
}

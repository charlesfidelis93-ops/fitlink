import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPublicProfile } from '@/actions'
import { notFound } from 'next/navigation'
import EditForm from '@/components/EditForm'

interface Props {
  params: Promise<{ share_token: string }>
}

export default async function EditPage({ params }: Props) {
  const { share_token } = await params

  // Verify edit session cookie
  const cookieStore = await cookies()
  const editSession = cookieStore.get(`edit_session_${share_token}`)

  if (!editSession || editSession.value !== 'authorized') {
    redirect(`/unlock/${share_token}`)
  }

  const data = await getPublicProfile(share_token)
  if (!data) notFound()

  return <EditForm shareToken={share_token} measurements={data.measurements} profile={data.profile} />
}

"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SidebarContainer from '../components/SidebarContainer'
import TrackBoard from '../components/TrackBoard'
import AddTodoCard from '../components/AddTodoCard'
import { getTrackById, getMatrixById, createNewTrack, updateMatrixTrack } from '../services/databaseService'
import { useMatrix } from '@/context/matrixContext'
import { useAuth } from '@/context/AuthContext'

const Track = () => {
    const [onclose, setOnclose] = useState(false)
    const [openAddTask, setOpenAddTask] = useState(false)
    const [trackData, setTrackData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const searchParams = useSearchParams()
    const trackId = searchParams.get('id')
    const { currentMatrixId } = useMatrix()
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const loadTrackData = async () => {
            try {
                setLoading(true)

                // If track ID is provided in URL, load that track
                if (trackId) {
                    const track = await getTrackById(trackId)
                    if (track) {
                        setTrackData(track)
                        setLoading(false)
                        return
                    }
                }

                // If no track ID in URL or track not found, check the current matrix
                if (currentMatrixId) {
                    const matrix = await getMatrixById(currentMatrixId)

                    if (matrix && matrix.track) {
                        // Matrix has a track, load it
                        const track = await getTrackById(matrix.track)
                        if (track) {
                            setTrackData(track)
                            // Update URL to include track ID
                            router.push(`/track?id=${matrix.track}`)
                        }
                    } else if (matrix) {
                        // Matrix exists but has no track, create one
                        const newTrack = await createNewTrack({
                            name: "Main Track",
                            created_by: user?.uid || null
                        })

                        // Update the matrix with this new track
                        await updateMatrixTrack(currentMatrixId, newTrack.track_id)

                        setTrackData(newTrack)
                        // Update URL to include new track ID
                        router.push(`/track?id=${newTrack.track_id}`)
                    } else {
                        // No matrix found, redirect to /
                        router.push('/')
                        return
                    }
                } else {
                    // No matrix selected, redirect to /
                    router.push('/')
                    return
                }
            } catch (err) {
                console.error("Error loading track:", err)
                setError("Failed to load track data")
            } finally {
                setLoading(false)
            }
        }

        loadTrackData()
    }, [trackId, currentMatrixId, router, user])

    return (
        <div className='w-full h-[98vh] gap-2'>
            <div className='flex my-2 h-[98vh] gap-2'>
                <SidebarContainer />
                <div className='w-[80%] rounded-[8px] h-[98vh] relative overflow-hidden'>
                    <div className='w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] overflow-hidden'>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white text-xl">Loading track data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white text-xl">{error}</p>
                            </div>
                        ) : (
                            <TrackBoard
                                setOpenAddTask={setOpenAddTask}
                                trackData={trackData}
                            />
                        )}
                    </div>
                    {openAddTask &&
                        <div className="absolute top-0 w-full h-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
                            <AddTodoCard
                                setOpenAddTask={setOpenAddTask}
                                trackId={trackData?.track_id}
                            />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Track
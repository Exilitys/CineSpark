import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface StoryData {
  story_id: string
  user_input: string
  generated_content: string
  edited_content: string | null
  timestamp: string
  status: 'draft' | 'published'
}

interface ApiResponse {
  success: boolean
  data: StoryData | null
  error: string | null
  timestamp: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const method = req.method

    // Route handling
    if (method === 'POST' && pathParts.includes('generate')) {
      return await handleGenerateStory(req, supabaseClient, user.id)
    } else if (method === 'GET' && pathParts.length >= 3) {
      const storyId = pathParts[pathParts.length - 1]
      return await handleGetStory(storyId, supabaseClient, user.id)
    } else if (method === 'PUT' && pathParts.length >= 3) {
      const storyId = pathParts[pathParts.length - 1]
      return await handleUpdateStory(storyId, req, supabaseClient, user.id)
    }

    throw new Error('Invalid endpoint')

  } catch (error) {
    console.error('API Error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      error: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleGenerateStory(req: Request, supabaseClient: any, userId: string) {
  const { user_input } = await req.json()

  if (!user_input || typeof user_input !== 'string' || user_input.trim().length < 10) {
    throw new Error('User input must be at least 10 characters long')
  }

  if (user_input.length > 1000) {
    throw new Error('User input must be less than 1000 characters')
  }

  // Check user credits
  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('credits')
    .eq('user_id', userId)
    .single()

  if (!profile || profile.credits < 10) {
    throw new Error('Insufficient credits for story generation')
  }

  // Simulate AI story generation (replace with actual AI service call)
  const generatedContent = await generateStoryContent(user_input)

  // Create story record
  const storyData: Omit<StoryData, 'story_id'> = {
    user_input: user_input.trim(),
    generated_content: generatedContent,
    edited_content: null,
    timestamp: new Date().toISOString(),
    status: 'draft'
  }

  const { data: story, error } = await supabaseClient
    .from('ai_stories')
    .insert({
      user_id: userId,
      ...storyData
    })
    .select()
    .single()

  if (error) throw error

  // Deduct credits
  await supabaseClient
    .from('user_profiles')
    .update({ credits: profile.credits - 10 })
    .eq('user_id', userId)

  const response: ApiResponse = {
    success: true,
    data: {
      story_id: story.id,
      ...storyData
    },
    error: null,
    timestamp: new Date().toISOString()
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleGetStory(storyId: string, supabaseClient: any, userId: string) {
  const { data: story, error } = await supabaseClient
    .from('ai_stories')
    .select('*')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single()

  if (error || !story) {
    throw new Error('Story not found')
  }

  const storyData: StoryData = {
    story_id: story.id,
    user_input: story.user_input,
    generated_content: story.generated_content,
    edited_content: story.edited_content,
    timestamp: story.timestamp,
    status: story.status
  }

  const response: ApiResponse = {
    success: true,
    data: storyData,
    error: null,
    timestamp: new Date().toISOString()
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleUpdateStory(storyId: string, req: Request, supabaseClient: any, userId: string) {
  const { edited_content, status } = await req.json()

  // Validation
  if (edited_content !== null) {
    if (typeof edited_content !== 'string') {
      throw new Error('Edited content must be a string')
    }
    if (edited_content.length < 10) {
      throw new Error('Edited content must be at least 10 characters long')
    }
    if (edited_content.length > 5000) {
      throw new Error('Edited content must be less than 5000 characters')
    }
  }

  if (status && !['draft', 'published'].includes(status)) {
    throw new Error('Status must be either "draft" or "published"')
  }

  // Check if story exists and belongs to user
  const { data: existingStory, error: fetchError } = await supabaseClient
    .from('ai_stories')
    .select('*')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !existingStory) {
    throw new Error('Story not found')
  }

  // Update story
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (edited_content !== undefined) {
    updateData.edited_content = edited_content
  }

  if (status) {
    updateData.status = status
  }

  const { data: updatedStory, error } = await supabaseClient
    .from('ai_stories')
    .update(updateData)
    .eq('id', storyId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  const storyData: StoryData = {
    story_id: updatedStory.id,
    user_input: updatedStory.user_input,
    generated_content: updatedStory.generated_content,
    edited_content: updatedStory.edited_content,
    timestamp: updatedStory.timestamp,
    status: updatedStory.status
  }

  const response: ApiResponse = {
    success: true,
    data: storyData,
    error: null,
    timestamp: new Date().toISOString()
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function generateStoryContent(userInput: string): Promise<string> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock story generation based on input
  const storyTemplates = [
    `In a world where ${userInput.toLowerCase()}, our protagonist discovers that nothing is as it seems. The journey begins when they encounter a mysterious figure who reveals a hidden truth that changes everything. Through trials and tribulations, they must overcome their deepest fears to save not only themselves but everyone they hold dear.`,
    
    `The story of ${userInput.toLowerCase()} unfolds in an unexpected way. What starts as an ordinary day becomes an extraordinary adventure filled with wonder, danger, and discovery. Our hero must navigate through challenges that test their courage, wisdom, and heart, ultimately learning that the greatest power comes from within.`,
    
    `Against the backdrop of ${userInput.toLowerCase()}, a tale of resilience and hope emerges. When faced with impossible odds, our characters must band together, using their unique strengths and unwavering determination to overcome the darkness that threatens their world. It's a story about the power of friendship, love, and the human spirit.`
  ]

  const randomTemplate = storyTemplates[Math.floor(Math.random() * storyTemplates.length)]
  
  return randomTemplate + `\n\nThis story explores themes of growth, discovery, and the triumph of good over evil. The characters face moral dilemmas that challenge their beliefs and force them to evolve. Through their journey, they learn valuable lessons about themselves and the world around them, ultimately emerging stronger and wiser than before.`
}
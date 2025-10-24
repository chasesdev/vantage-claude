/**
 * Narrative Service
 *
 * Subscribes to Temporal workflow events and pushes patient-facing
 * narrative updates via WebSocket.
 *
 * See: docs/architecture/decisions/ADR-003-narrative-layer-architecture.md
 */

import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { loadTemplate, toNarrative } from '@vantage/narrative'
import type { WorkflowEvent } from '@vantage/narrative'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const PORT = process.env.PORT || 3001

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'narrative-service' })
})

// WebSocket connection handler
wss.on('connection', (socket, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const sessionId = url.searchParams.get('sessionId')
  const modality = url.searchParams.get('modality') || 'oct'

  if (!sessionId) {
    socket.close(1008, 'Missing sessionId parameter')
    return
  }

  console.log(`[WS] Client connected: session=${sessionId}, modality=${modality}`)

  // Load narrative template for this modality
  let template
  try {
    template = loadTemplate(modality)
  } catch (err) {
    console.error(`[WS] Failed to load template for ${modality}:`, err)
    socket.close(1011, `Template not found for ${modality}`)
    return
  }

  // TODO: Subscribe to Temporal workflow events for this session
  // For now, this is a placeholder for the subscription logic
  // In production, this would use Temporal SDK to listen for workflow signals

  socket.on('message', (data) => {
    try {
      // Parse incoming workflow event
      const event: WorkflowEvent = JSON.parse(data.toString())

      // Map to narrative event
      const narrative = toNarrative(event, template)

      // Send back to client
      socket.send(JSON.stringify(narrative))

      console.log(`[WS] Sent narrative: session=${sessionId}, step=${event.step}`)
    } catch (err) {
      console.error('[WS] Error processing message:', err)
    }
  })

  socket.on('close', () => {
    console.log(`[WS] Client disconnected: session=${sessionId}`)
  })

  socket.on('error', (err) => {
    console.error('[WS] Socket error:', err)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`Narrative Service listening on port ${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}?sessionId=<id>&modality=<modality>`)
})

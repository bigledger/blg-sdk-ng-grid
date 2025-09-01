import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';
import { TestAudioGenerator, TEST_AUDIO_FILES, AUDIO_TEST_SCENARIOS } from './fixtures/test-audio';

test.describe('TTS and Lip Sync Functionality', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-tts-demo');
  });

  test.describe('Text-to-Speech Engine', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await page.evaluate((config) => {
        const avatarTTS = document.querySelector('lib-avatar-tts') as any;
        if (avatarTTS && avatarTTS.initialize) {
          avatarTTS.initialize(config);
        }
      }, config);
      await avatarPage.waitForAvatarInit();
    });

    test('should synthesize speech from text', async ({ page }) => {
      const testPhrases = AvatarTestDataGenerator.getTestPhrases();
      
      for (const phrase of testPhrases.slice(0, 3)) {
        await avatarPage.speakText(phrase.text);
        
        // Wait for TTS to start
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return avatar?.isPlaying?.() || false;
        }, { timeout: 10000 });
        
        // Should be speaking
        const isSpeaking = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return avatar?.isPlaying?.() || false;
        });
        
        expect(isSpeaking).toBe(true);
        
        // Wait for speech to complete
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return !avatar?.isPlaying?.();
        }, { timeout: phrase.expectedDuration + 5000 });
      }
    });

    test('should support different voice providers', async ({ page }) => {
      const providers = ['elevenlabs', 'azure', 'google', 'mock'];
      
      for (const provider of providers) {
        await page.evaluate((provider) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration({
              voice: { provider }
            });
          }
        }, provider);
        
        await avatarPage.speakText('Testing voice provider');
        
        // Should handle different providers gracefully
        await page.waitForTimeout(2000);
        await expect(avatarPage.errorMessage).not.toBeVisible();
      }
    });

    test('should handle voice configuration changes', async ({ page }) => {
      const voiceConfig = {
        rate: 1.5,
        pitch: 0.2,
        volume: 0.9
      };
      
      await page.evaluate((config) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({ voice: config });
        }
      }, voiceConfig);
      
      await avatarPage.speakText('Voice configuration test');
      
      // Should speak with modified voice settings
      await page.waitForTimeout(3000);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should support SSML markup', async ({ page }) => {
      const ssmlText = `
        <speak>
          <prosody rate="slow" pitch="low">
            This is spoken slowly and with a low pitch.
          </prosody>
          <break time="1s"/>
          <prosody rate="fast" pitch="high">
            This is spoken quickly and with a high pitch.
          </prosody>
        </speak>
      `;
      
      await page.evaluate((ssml) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.speakSSML) {
          avatar.speakSSML(ssml);
        } else if (avatar && avatar.speak) {
          avatar.speak(ssml);
        }
      }, ssmlText);
      
      await page.waitForTimeout(8000);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should queue multiple speech requests', async ({ page }) => {
      const phrases = [
        'First message',
        'Second message', 
        'Third message'
      ];
      
      // Queue multiple messages quickly
      for (const phrase of phrases) {
        await avatarPage.speakText(phrase);
      }
      
      // Check queue length
      const queueLength = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        const stats = avatar?.getStatistics?.();
        return stats?.queueLength || 0;
      });
      
      expect(queueLength).toBeGreaterThan(0);
      
      // Wait for all messages to complete
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        const stats = avatar?.getStatistics?.();
        return (stats?.queueLength || 0) === 0 && !avatar?.isPlaying?.();
      }, { timeout: 15000 });
    });

    test('should handle interruptions', async ({ page }) => {
      // Start speaking a long message
      await avatarPage.speakText('This is a very long message that should be interrupted before it completes speaking all the way through.');
      
      // Wait for speech to start
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isPlaying?.() || false;
      }, { timeout: 5000 });
      
      // Interrupt with high priority message
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.speak) {
          avatar.speak('Urgent interruption!', { 
            priority: 'urgent', 
            interrupt: true 
          });
        }
      });
      
      // Should stop current speech and start urgent message
      await page.waitForTimeout(2000);
      
      const isPlaying = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isPlaying?.() || false;
      });
      
      expect(isPlaying).toBe(true);
    });
  });

  test.describe('Audio Processing', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await page.evaluate((config) => {
        const avatarTTS = document.querySelector('lib-avatar-tts') as any;
        if (avatarTTS && avatarTTS.initialize) {
          avatarTTS.initialize(config);
        }
      }, config);
      await avatarPage.waitForAvatarInit();
    });

    test('should process audio for lip sync', async ({ page }) => {
      // Generate test audio
      const audioBuffer = TestAudioGenerator.generateSpeechLike(3000);
      const audioDataUrl = TestAudioGenerator.toDataUrl(audioBuffer);
      
      // Load audio
      await page.evaluate((audioUrl) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.playAudio) {
          // Convert data URL to array buffer
          fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(buffer => {
              avatar.playAudio(buffer, 'wav', { lipSync: true });
            });
        }
      }, audioDataUrl);
      
      // Wait for processing
      await avatarPage.waitForAudioProcessing();
      
      // Should generate lip sync data
      const hasLipSyncData = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncData?.length > 0;
      });
      
      expect(hasLipSyncData).toBe(true);
    });

    test('should handle different audio formats', async ({ page }) => {
      const formats = ['wav', 'mp3', 'ogg'];
      
      for (const format of formats) {
        const audioBuffer = TestAudioGenerator.generateSpeechLike(2000);
        const audioDataUrl = TestAudioGenerator.toDataUrl(audioBuffer, format);
        
        await page.evaluate((audioUrl, fmt) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.playAudio) {
            fetch(audioUrl)
              .then(response => response.arrayBuffer())
              .then(buffer => {
                avatar.playAudio(buffer, fmt, { lipSync: true });
              });
          }
        }, audioDataUrl, format);
        
        await page.waitForTimeout(3000);
        await expect(avatarPage.errorMessage).not.toBeVisible();
      }
    });

    test('should analyze audio amplitude', async ({ page }) => {
      const audioBuffer = TestAudioGenerator.generateSineWave(2000, 440, 22050, 0.8);
      const audioDataUrl = TestAudioGenerator.toDataUrl(audioBuffer);
      
      await page.evaluate((audioUrl) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.playAudio) {
          fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(buffer => {
              avatar.playAudio(buffer, 'wav', { lipSync: true });
            });
        }
      }, audioDataUrl);
      
      // Wait for analysis
      await page.waitForTimeout(3000);
      
      // Should detect amplitude variations
      const amplitudeData = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.audioAnalyzer?.getAmplitudeData?.() || [];
      });
      
      expect(amplitudeData.length).toBeGreaterThan(0);
      expect(Math.max(...amplitudeData)).toBeGreaterThan(0.5);
    });

    test('should handle noise reduction', async ({ page }) => {
      // Generate noisy audio
      const speechBuffer = TestAudioGenerator.generateSpeechLike(2000);
      const noiseBuffer = TestAudioGenerator.generateWhiteNoise(2000, 22050, 0.3);
      
      // Mix speech with noise (simplified)
      const mixedBuffer = new ArrayBuffer(speechBuffer.byteLength);
      const speechView = new Int16Array(speechBuffer);
      const noiseView = new Int16Array(noiseBuffer);
      const mixedView = new Int16Array(mixedBuffer);
      
      for (let i = 0; i < speechView.length; i++) {
        mixedView[i] = Math.floor((speechView[i] * 0.7) + (noiseView[i % noiseView.length] * 0.3));
      }
      
      const noisyAudioUrl = TestAudioGenerator.toDataUrl(mixedBuffer);
      
      await page.evaluate((audioUrl) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.playAudio) {
          fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(buffer => {
              avatar.playAudio(buffer, 'wav', { 
                lipSync: true,
                noiseReduction: true 
              });
            });
        }
      }, noisyAudioUrl);
      
      await page.waitForTimeout(4000);
      
      // Should process without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });

  test.describe('Phoneme Detection', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await page.evaluate((config) => {
        const avatarTTS = document.querySelector('lib-avatar-tts') as any;
        if (avatarTTS && avatarTTS.initialize) {
          avatarTTS.initialize(config);
        }
      }, config);
      await avatarPage.waitForAvatarInit();
    });

    test('should detect phonemes from speech', async ({ page }) => {
      await avatarPage.speakText('Hello world, how are you today?');
      
      // Wait for phoneme detection
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncService?.phonemeData?.length > 0;
      }, { timeout: 10000 });
      
      const phonemeData = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncService?.phonemeData || [];
      });
      
      expect(phonemeData.length).toBeGreaterThan(10);
      
      // Check phoneme structure
      const firstPhoneme = phonemeData[0];
      expect(firstPhoneme).toHaveProperty('timestamp');
      expect(firstPhoneme).toHaveProperty('phoneme');
      expect(firstPhoneme).toHaveProperty('amplitude');
    });

    test('should map phonemes to visemes', async ({ page }) => {
      await avatarPage.speakText('Beautiful mountains and valleys');
      
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncService?.visemeData?.length > 0;
      }, { timeout: 10000 });
      
      const visemeData = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncService?.visemeData || [];
      });
      
      expect(visemeData.length).toBeGreaterThan(5);
      
      // Should contain recognizable visemes
      const visemes = visemeData.map((v: any) => v.viseme);
      expect(visemes).toContain('aa'); // For 'beautiful'
      expect(visemes).toContain('sil'); // For silence/pauses
    });

    test('should handle different languages', async ({ page }) => {
      const testPhrases = [
        { text: 'Hello world', language: 'en-US' },
        { text: 'Hola mundo', language: 'es-ES' },
        { text: 'Bonjour monde', language: 'fr-FR' }
      ];
      
      for (const phrase of testPhrases) {
        await page.evaluate((config) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration({
              voice: { language: config.language }
            });
          }
        }, phrase);
        
        await avatarPage.speakText(phrase.text);
        
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return avatar?.lipSyncService?.phonemeData?.length > 0;
        }, { timeout: 10000 });
        
        const phonemeData = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          const data = avatar?.lipSyncService?.phonemeData || [];
          return data.slice(); // Copy array
        });
        
        expect(phonemeData.length).toBeGreaterThan(3);
        
        // Clear data for next test
        await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar?.lipSyncService) {
            avatar.lipSyncService.phonemeData = [];
          }
        });
      }
    });

    test('should handle rapid speech changes', async ({ page }) => {
      // Speak multiple words quickly
      const rapidWords = ['quick', 'brown', 'fox', 'jumps', 'over'];
      
      for (const word of rapidWords) {
        await avatarPage.speakText(word);
        await page.waitForTimeout(100); // Very short delay
      }
      
      // Should handle rapid phoneme changes
      await page.waitForTimeout(5000);
      
      const phonemeData = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.lipSyncService?.phonemeData || [];
      });
      
      expect(phonemeData.length).toBeGreaterThan(15);
      
      // Should have varying phonemes (not stuck on one)
      const uniquePhonemes = new Set(phonemeData.map((p: any) => p.phoneme));
      expect(uniquePhonemes.size).toBeGreaterThan(5);
    });
  });

  test.describe('Lip Sync Animation', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await avatarPage.goto('/avatar-2d-demo'); // Use 2D avatar for lip sync testing
      await avatarPage.init2DAvatar(config);
    });

    test('should animate lip sync with speech', async ({ page }) => {
      await avatarPage.speakText('Testing lip synchronization');
      
      // Wait for speech to start
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isPlaying?.() || false;
      }, { timeout: 5000 });
      
      await avatarPage.assertLipSyncActive();
      
      // Take screenshot during speech
      await page.waitForTimeout(1000);
      await avatarPage.takeAvatarScreenshot('lip-sync-active');
      
      // Wait for speech to end
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return !avatar?.isPlaying?.();
      }, { timeout: 10000 });
      
      // Lip sync should stop
      await page.waitForTimeout(1000);
      const isLipSyncActive = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isLipSyncPlaying?.() || false;
      });
      
      expect(isLipSyncActive).toBe(false);
    });

    test('should synchronize mouth movements with phonemes', async ({ page }) => {
      await avatarPage.speakText('Pa-pa-pa-pa-pa'); // Clear P sounds
      
      // Monitor mouth position during speech
      const mouthPositions: number[] = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 5000) {
        const mouthState = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-2d') as any;
          return avatar?.currentExpression?.mouthState?.openness || 0;
        });
        
        mouthPositions.push(mouthState);
        await page.waitForTimeout(100);
      }
      
      // Should have mouth movement variations
      const maxMouth = Math.max(...mouthPositions);
      const minMouth = Math.min(...mouthPositions);
      const variation = maxMouth - minMouth;
      
      expect(variation).toBeGreaterThan(0.3); // Significant mouth movement
    });

    test('should handle overlapping expressions and lip sync', async ({ page }) => {
      // Set an expression
      await avatarPage.changeExpression('happy');
      
      // Start speaking while expression is active
      await avatarPage.speakText('Speaking while happy');
      
      // Both expression and lip sync should be active
      await page.waitForTimeout(2000);
      
      const expressionActive = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return avatar?.currentExpression?.id === 'happy';
      });
      
      const lipSyncActive = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isLipSyncPlaying?.() || false;
      });
      
      expect(expressionActive).toBe(true);
      expect(lipSyncActive).toBe(true);
    });

    test('should maintain lip sync accuracy over time', async ({ page }) => {
      const longText = 'This is a longer piece of text designed to test the accuracy and stability of lip synchronization over an extended period. It contains various phonemes and should maintain good sync throughout.';
      
      await avatarPage.speakText(longText);
      
      // Sample mouth positions at regular intervals
      const samples: Array<{ time: number; mouthState: number; expectedPhoneme: string }> = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 12000) { // 12 seconds
        const currentTime = Date.now() - startTime;
        
        const lipSyncState = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          const lipSync = avatar?.lipSyncService;
          return {
            mouthState: avatar?.currentExpression?.mouthState?.openness || 0,
            currentPhoneme: lipSync?.currentPhoneme || 'SIL',
            isActive: lipSync?.isPlaying || false
          };
        });
        
        if (lipSyncState.isActive) {
          samples.push({
            time: currentTime,
            mouthState: lipSyncState.mouthState,
            expectedPhoneme: lipSyncState.currentPhoneme
          });
        }
        
        await page.waitForTimeout(200);
      }
      
      // Analyze sync quality
      expect(samples.length).toBeGreaterThan(20);
      
      // Check for reasonable mouth movement patterns
      const vowelPhonemes = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
      const vowelSamples = samples.filter(s => vowelPhonemes.includes(s.expectedPhoneme));
      
      if (vowelSamples.length > 0) {
        const avgVowelMouth = vowelSamples.reduce((sum, s) => sum + s.mouthState, 0) / vowelSamples.length;
        expect(avgVowelMouth).toBeGreaterThan(0.3); // Vowels should open mouth more
      }
    });

    test('should handle audio file lip sync', async ({ page }) => {
      // Create test audio file path
      const audioPath = './e2e/avatar/fixtures/audio/test-speech.wav';
      
      // Generate and save test audio file (if needed)
      const audioBuffer = TestAudioGenerator.generateSpeechLike(3000);
      
      // Load audio via file input
      await page.setInputFiles('input[type="file"][accept="audio/*"]', {
        name: 'test-speech.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from(audioBuffer)
      });
      
      // Wait for processing
      await avatarPage.waitForAudioProcessing();
      
      // Start lip sync
      await avatarPage.startLipSync();
      
      await page.waitForTimeout(4000);
      
      // Should be lip syncing
      await avatarPage.assertLipSyncActive();
      
      await avatarPage.takeAvatarScreenshot('file-lip-sync');
    });
  });

  test.describe('Synchronization Accuracy', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      config.audio.sampleRate = 22050;
      await avatarPage.goto('/avatar-2d-demo');
      await avatarPage.init2DAvatar(config);
    });

    test('should maintain sync with different speech rates', async ({ page }) => {
      const speechRates = [0.5, 1.0, 1.5, 2.0];
      
      for (const rate of speechRates) {
        await page.evaluate((rate) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration({
              voice: { rate }
            });
          }
        }, rate);
        
        await avatarPage.speakText('Testing speech rate synchronization');
        
        // Monitor sync accuracy
        let syncAccurate = true;
        const startTime = Date.now();
        
        while (Date.now() - startTime < 8000) {
          const syncData = await page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            const lipSync = avatar?.lipSyncService;
            return {
              isPlaying: lipSync?.isPlaying || false,
              currentPhoneme: lipSync?.currentPhoneme || 'SIL',
              mouthState: avatar?.currentExpression?.mouthState?.openness || 0
            };
          });
          
          // Simple sync check: if playing speech, mouth should be somewhat open
          if (syncData.isPlaying && syncData.currentPhoneme !== 'SIL' && syncData.mouthState < 0.1) {
            syncAccurate = false;
            break;
          }
          
          await page.waitForTimeout(100);
        }
        
        expect(syncAccurate).toBe(true);
        
        // Wait for completion
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return !avatar?.isPlaying?.();
        }, { timeout: 10000 });
      }
    });

    test('should handle audio latency compensation', async ({ page }) => {
      // Introduce artificial audio latency
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({
            audio: { 
              bufferSize: 4096, // Larger buffer = more latency
              latencyCompensation: 100 // 100ms compensation
            }
          });
        }
      });
      
      await avatarPage.speakText('Latency compensation test message');
      
      // Monitor for sync drift
      const syncMeasurements: Array<{ audioTime: number; lipSyncTime: number; drift: number }> = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 6000) {
        const measurement = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          const audioTime = avatar?.audioElement?.currentTime || 0;
          const lipSyncTime = avatar?.lipSyncService?.currentTime || 0;
          return {
            audioTime,
            lipSyncTime,
            drift: Math.abs(audioTime - lipSyncTime)
          };
        });
        
        if (measurement.audioTime > 0) {
          syncMeasurements.push(measurement);
        }
        
        await page.waitForTimeout(200);
      }
      
      if (syncMeasurements.length > 0) {
        const avgDrift = syncMeasurements.reduce((sum, m) => sum + m.drift, 0) / syncMeasurements.length;
        expect(avgDrift).toBeLessThan(0.15); // Less than 150ms average drift
      }
    });

    test('should adapt to performance constraints', async ({ page }) => {
      // Simulate performance pressure
      await page.evaluate(() => {
        const heavyComputationWorker = () => {
          const start = performance.now();
          while (performance.now() - start < 50) {
            // Busy wait to simulate load
          }
          requestAnimationFrame(heavyComputationWorker);
        };
        heavyComputationWorker();
      });
      
      await avatarPage.speakText('Performance adaptation test under load');
      
      // Should maintain reasonable sync despite performance pressure
      await page.waitForTimeout(5000);
      
      const performanceStats = await avatarPage.getPerformanceStats();
      expect(performanceStats.fps).toBeGreaterThan(15); // Should maintain minimum FPS
      
      // Lip sync should still be functional
      const lipSyncActive = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isLipSyncPlaying?.() || false;
      });
      
      expect(lipSyncActive).toBe(true);
    });
  });

  test.describe('Audio Test Scenarios', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await avatarPage.goto('/avatar-2d-demo');
      await avatarPage.init2DAvatar(config);
    });

    Object.entries(AUDIO_TEST_SCENARIOS).forEach(([scenarioKey, scenario]) => {
      test(`should handle ${scenario.name}`, async ({ page }) => {
        for (const fileKey of scenario.files.slice(0, 2)) { // Test first 2 files per scenario
          const fileInfo = TEST_AUDIO_FILES[fileKey as keyof typeof TEST_AUDIO_FILES];
          
          if (fileKey === 'silence') {
            // Test silence handling
            await avatarPage.speakText('');
            await page.waitForTimeout(2000);
            
            const isPlaying = await page.evaluate(() => {
              const avatar = document.querySelector('lib-avatar-core') as any;
              return avatar?.isPlaying?.() || false;
            });
            
            expect(isPlaying).toBe(false);
          } else {
            // Test with actual content
            await avatarPage.speakText(fileInfo.text);
            
            if (scenario.expectedAccuracy) {
              // Monitor sync accuracy
              let accurateFrames = 0;
              let totalFrames = 0;
              const startTime = Date.now();
              
              while (Date.now() - startTime < Math.min(fileInfo.duration + 2000, 8000)) {
                const syncState = await page.evaluate(() => {
                  const avatar = document.querySelector('lib-avatar-core') as any;
                  const lipSync = avatar?.lipSyncService;
                  return {
                    isPlaying: lipSync?.isPlaying || false,
                    phoneme: lipSync?.currentPhoneme || 'SIL',
                    mouthState: avatar?.currentExpression?.mouthState?.openness || 0,
                    amplitude: lipSync?.currentAmplitude || 0
                  };
                });
                
                totalFrames++;
                
                // Simple accuracy check: mouth should correlate with amplitude
                if (!syncState.isPlaying || 
                    (syncState.amplitude > 0.3 && syncState.mouthState > 0.2) ||
                    (syncState.amplitude < 0.1 && syncState.mouthState < 0.3) ||
                    syncState.phoneme === 'SIL') {
                  accurateFrames++;
                }
                
                await page.waitForTimeout(100);
              }
              
              const accuracy = totalFrames > 0 ? accurateFrames / totalFrames : 0;
              expect(accuracy).toBeGreaterThanOrEqual(scenario.expectedAccuracy * 0.8); // Allow 20% tolerance
            }
          }
          
          // Wait for completion
          await page.waitForFunction(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            return !avatar?.isPlaying?.();
          }, { timeout: fileInfo.duration + 5000 });
        }
      });
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle audio processing errors', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await avatarPage.goto('/avatar-2d-demo');
      await avatarPage.init2DAvatar(config);

      // Provide invalid audio data
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.playAudio) {
          avatar.playAudio('invalid-audio-data', 'wav', { lipSync: true });
        }
      });
      
      // Should handle error gracefully
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 5000 });
      
      // Should recover and work with valid audio
      await avatarPage.speakText('Recovery test after error');
      await page.waitForTimeout(3000);
    });

    test('should handle TTS service failures', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.voice.provider = 'invalid-provider';
      
      await page.evaluate((config) => {
        const avatarTTS = document.querySelector('lib-avatar-tts') as any;
        if (avatarTTS && avatarTTS.initialize) {
          avatarTTS.initialize(config);
        }
      }, config);
      
      await avatarPage.speakText('This should fail');
      
      // Should show appropriate error
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should handle WebAudio context suspension', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await avatarPage.goto('/avatar-2d-demo');
      await avatarPage.init2DAvatar(config);

      // Suspend audio context
      await page.evaluate(() => {
        const audioContext = (window as any).audioContext;
        if (audioContext && audioContext.suspend) {
          audioContext.suspend();
        }
      });
      
      await avatarPage.speakText('Testing with suspended audio context');
      
      // Should handle suspended context
      await page.waitForTimeout(3000);
      
      // Resume context
      await page.evaluate(() => {
        const audioContext = (window as any).audioContext;
        if (audioContext && audioContext.resume) {
          audioContext.resume();
        }
      });
      
      await page.waitForTimeout(2000);
    });

    test('should handle memory pressure during processing', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.lipSync = true;
      await avatarPage.goto('/avatar-2d-demo');
      await avatarPage.init2DAvatar(config);

      // Create memory pressure
      await page.evaluate(() => {
        const largeArrays = [];
        try {
          for (let i = 0; i < 50; i++) {
            largeArrays.push(new Array(100000).fill(Math.random()));
          }
          (window as any).memoryPressureArrays = largeArrays;
        } catch (e) {
          // Expected if we run out of memory
        }
      });
      
      // Should continue to work under memory pressure
      await avatarPage.speakText('Memory pressure test');
      
      await page.waitForTimeout(5000);
      
      // Clean up
      await page.evaluate(() => {
        delete (window as any).memoryPressureArrays;
      });
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(10); // Should maintain minimum performance
    });
  });
});
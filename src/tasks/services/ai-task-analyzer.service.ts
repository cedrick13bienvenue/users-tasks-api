import { Injectable, Logger } from '@nestjs/common';
import * as natural from 'natural';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskCategory } from '../enums/task-category.enum';

@Injectable()
export class EnhancedAiTaskAnalyzerService {
  private readonly logger = new Logger(EnhancedAiTaskAnalyzerService.name);

  // Enhanced priority detection with NLP
  private readonly priorityPatterns = {
    [TaskPriority.URGENT]: {
      keywords: ['urgent', 'asap', 'emergency', 'critical', 'deadline', 'due today', 'immediate', 'now', 'rush'],
      timeIndicators: ['today', 'now', 'immediately', 'asap', 'right away'],
      intensityModifiers: ['very', 'extremely', 'absolutely', 'completely']
    },
    [TaskPriority.HIGH]: {
      keywords: ['important', 'priority', 'high', 'top', 'main', 'key', 'essential', 'crucial', 'vital', 'significant'],
      timeIndicators: ['this week', 'soon', 'quickly', 'promptly'],
      intensityModifiers: ['very', 'really', 'quite']
    },
    [TaskPriority.MEDIUM]: {
      keywords: ['normal', 'regular', 'standard', 'usual', 'typical', 'moderate'],
      timeIndicators: ['this month', 'when possible', 'sometime'],
      intensityModifiers: ['kind of', 'sort of', 'maybe']
    },
    [TaskPriority.LOW]: {
      keywords: ['low', 'minor', 'optional', 'when possible', 'sometime', 'later', 'low priority', 'not urgent', 'can wait'],
      timeIndicators: ['later', 'sometime', 'when convenient', 'no rush'],
      intensityModifiers: ['not very', 'hardly', 'barely']
    }
  };

  // Enhanced category detection with NLP
  private readonly categoryPatterns = {
    [TaskCategory.WORK]: {
      keywords: ['work', 'job', 'office', 'meeting', 'report', 'presentation', 'project', 'deadline', 'client', 'customer'],
      entities: ['company', 'business', 'professional', 'team', 'colleague', 'boss', 'manager'],
      actions: ['submit', 'review', 'approve', 'present', 'discuss', 'plan']
    },
    [TaskCategory.PERSONAL]: {
      keywords: ['personal', 'family', 'friend', 'birthday', 'anniversary', 'celebration', 'party', 'gift'],
      entities: ['family', 'friend', 'relationship', 'dating', 'marriage', 'kids'],
      actions: ['celebrate', 'visit', 'call', 'meet', 'gift']
    },
    [TaskCategory.HEALTH]: {
      keywords: ['health', 'medical', 'doctor', 'appointment', 'checkup', 'medicine', 'exercise', 'workout'],
      entities: ['doctor', 'hospital', 'clinic', 'gym', 'pharmacy'],
      actions: ['exercise', 'workout', 'diet', 'sleep', 'rest']
    },
    [TaskCategory.FINANCE]: {
      keywords: ['finance', 'money', 'bill', 'payment', 'budget', 'expense', 'income', 'bank', 'account'],
      entities: ['bank', 'account', 'bill', 'payment', 'investment'],
      actions: ['pay', 'save', 'invest', 'budget', 'spend']
    },
    [TaskCategory.LEARNING]: {
      keywords: ['learn', 'study', 'course', 'training', 'education', 'skill', 'tutorial', 'book', 'reading'],
      entities: ['course', 'book', 'tutorial', 'training', 'skill'],
      actions: ['learn', 'study', 'practice', 'improve', 'develop', 'master']
    },
    [TaskCategory.SHOPPING]: {
      keywords: ['buy', 'purchase', 'shop', 'shopping', 'order', 'grocery', 'clothes', 'electronics'],
      entities: ['store', 'shop', 'market', 'mall', 'online'],
      actions: ['buy', 'purchase', 'order', 'get', 'find']
    },
    [TaskCategory.TRAVEL]: {
      keywords: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'booking', 'reservation', 'journey'],
      entities: ['flight', 'hotel', 'destination', 'vacation', 'trip'],
      actions: ['book', 'reserve', 'plan', 'visit', 'explore']
    },
    [TaskCategory.HOME]: {
      keywords: ['home', 'house', 'cleaning', 'maintenance', 'repair', 'decorate', 'organize'],
      entities: ['house', 'home', 'room', 'garden', 'kitchen'],
      actions: ['clean', 'organize', 'decorate', 'repair', 'maintain']
    }
  };

  /**
   * Enhanced task analysis using Natural NLP library
   */
  analyzeTask(title: string, description?: string): {
    priority: TaskPriority;
    category: TaskCategory;
    confidence: number;
    reasoning: string[];
    nlpInsights: {
      sentiment: number;
      entities: string[];
      tokens: string[];
      timeIndicators: string[];
    };
  } {
    const text = `${title} ${description || ''}`.toLowerCase();
    this.logger.debug(`Enhanced NLP analysis for: "${text}"`);

    // NLP Analysis
    const tokens = new natural.WordTokenizer().tokenize(text) || [];
    const sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn').getSentiment(tokens);
    const entities = this.extractEntities(text, tokens);
    const timeIndicators = this.extractTimeIndicators(text);

    // Enhanced priority detection
    const priority = this.determinePriorityWithNLP(text, tokens, sentiment, timeIndicators);
    
    // Enhanced category detection
    const category = this.determineCategoryWithNLP(text, tokens, entities);
    
    // Calculate confidence with NLP factors
    const confidence = this.calculateNLPConfidence(text, priority, category, sentiment, entities);
    
    // Generate detailed reasoning
    const reasoning = this.generateNLPReasoning(text, priority, category, sentiment, entities, timeIndicators);

    this.logger.debug(`Enhanced NLP result: Priority=${priority}, Category=${category}, Confidence=${confidence}, Sentiment=${sentiment}`);

    return {
      priority,
      category,
      confidence,
      reasoning,
      nlpInsights: {
        sentiment,
        entities,
        tokens,
        timeIndicators
      }
    };
  }

  /**
   * Enhanced priority detection using NLP
   */
  private determinePriorityWithNLP(text: string, tokens: string[], sentiment: number, timeIndicators: string[]): TaskPriority {
    let maxScore = 0;
    let selectedPriority = TaskPriority.MEDIUM;

    for (const [priority, patterns] of Object.entries(this.priorityPatterns)) {
      let score = 0;
      
      // Keyword matching
      score += this.calculateKeywordScore(text, patterns.keywords);
      
      // Time urgency analysis
      score += this.calculateTimeUrgencyScore(timeIndicators, patterns.timeIndicators);
      
      // Sentiment analysis
      score += this.calculateSentimentScore(sentiment, priority);
      
      // Intensity modifier analysis
      score += this.calculateIntensityScore(text, patterns.intensityModifiers);
      
      // Negation handling
      score += this.calculateNegationScore(text, priority);
      
      if (score > maxScore) {
        maxScore = score;
        selectedPriority = priority as TaskPriority;
      }
    }

    return selectedPriority;
  }

  /**
   * Enhanced category detection using NLP
   */
  private determineCategoryWithNLP(text: string, tokens: string[], entities: string[]): TaskCategory {
    let maxScore = 0;
    let selectedCategory = TaskCategory.OTHER;

    for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
      let score = 0;
      
      // Keyword matching
      score += this.calculateKeywordScore(text, patterns.keywords);
      
      // Entity matching
      score += this.calculateEntityScore(entities, patterns.entities);
      
      // Action verb matching
      score += this.calculateActionScore(text, patterns.actions);
      
      // Context analysis
      score += this.calculateContextScore(text, category);
      
      if (score > maxScore) {
        maxScore = score;
        selectedCategory = category as TaskCategory;
      }
    }

    return selectedCategory;
  }

  /**
   * Extract entities from text using NLP
   */
  private extractEntities(text: string, tokens: string[]): string[] {
    const entities: string[] = [];
    
    // Named entity recognition patterns
    const namePatterns = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const companyPatterns = /\b[A-Z][a-z]+ (Inc|Corp|LLC|Ltd|Company)\b/g;
    const projectPatterns = /\b(Project|Task|Initiative) [A-Z][a-z]+\b/g;
    
    // Extract matches
    const names = text.match(namePatterns) || [];
    const companies = text.match(companyPatterns) || [];
    const projects = text.match(projectPatterns) || [];
    
    entities.push(...names, ...companies, ...projects);
    
    return entities;
  }

  /**
   * Extract time indicators from text
   */
  private extractTimeIndicators(text: string): string[] {
    const timeWords = [
      'today', 'tomorrow', 'yesterday', 'now', 'soon', 'later', 'asap',
      'this week', 'next week', 'this month', 'next month',
      'urgently', 'immediately', 'promptly', 'quickly'
    ];
    
    return timeWords.filter(word => text.includes(word));
  }

  /**
   * Calculate time urgency score
   */
  private calculateTimeUrgencyScore(foundTimeIndicators: string[], expectedTimeIndicators: string[]): number {
    let score = 0;
    for (const found of foundTimeIndicators) {
      if (expectedTimeIndicators.includes(found)) {
        score += 2; // Higher weight for time indicators
      }
    }
    return score;
  }

  /**
   * Calculate sentiment score for priority
   */
  private calculateSentimentScore(sentiment: number, priority: string): number {
    if (priority === TaskPriority.URGENT && sentiment > 0.3) return 3;
    if (priority === TaskPriority.HIGH && sentiment > 0.1) return 2;
    if (priority === TaskPriority.LOW && sentiment < -0.1) return 2;
    return 0;
  }

  /**
   * Calculate intensity modifier score
   */
  private calculateIntensityScore(text: string, intensityModifiers: string[]): number {
    let score = 0;
    for (const modifier of intensityModifiers) {
      if (text.includes(modifier)) {
        score += 1.5;
      }
    }
    return score;
  }

  /**
   * Handle negation in text
   */
  private calculateNegationScore(text: string, priority: string): number {
    const negations = ['not', 'no', 'never', 'isn\'t', 'aren\'t', 'don\'t', 'doesn\'t'];
    const hasNegation = negations.some(neg => text.includes(neg));
    
    if (hasNegation) {
      // If text has negation, reduce score for high priority patterns
      if (priority === TaskPriority.URGENT || priority === TaskPriority.HIGH) {
        return -3;
      }
      // Increase score for low priority patterns
      if (priority === TaskPriority.LOW) {
        return 2;
      }
    }
    
    return 0;
  }

  /**
   * Calculate entity score
   */
  private calculateEntityScore(foundEntities: string[], expectedEntities: string[]): number {
    let score = 0;
    for (const found of foundEntities) {
      if (expectedEntities.some(expected => found.toLowerCase().includes(expected.toLowerCase()))) {
        score += 2;
      }
    }
    return score;
  }

  /**
   * Calculate action verb score
   */
  private calculateActionScore(text: string, actions: string[]): number {
    let score = 0;
    for (const action of actions) {
      if (text.includes(action)) {
        score += 1.5;
      }
    }
    return score;
  }

  /**
   * Calculate context score
   */
  private calculateContextScore(text: string, category: string): number {
    // Context-specific scoring
    if (category === TaskCategory.WORK && text.includes('home')) return -1;
    if (category === TaskCategory.PERSONAL && text.includes('office')) return -1;
    if (category === TaskCategory.HEALTH && text.includes('work')) return -0.5;
    
    return 0;
  }

  /**
   * Calculate keyword score with NLP enhancement
   */
  private calculateKeywordScore(text: string, keywords: string[]): number {
    let score = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
        
        // Bonus for exact word boundaries
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(text)) {
          score += 0.5;
        }
        
        // Bonus for word position
        if (text.startsWith(keyword) || text.endsWith(keyword)) {
          score += 0.3;
        }
      }
    }
    
    return score;
  }

  /**
   * Calculate confidence with NLP factors
   */
  private calculateNLPConfidence(text: string, priority: TaskPriority, category: TaskCategory, sentiment: number, entities: string[]): number {
    const baseConfidence = 0.5;
    
    // Keyword confidence
    const priorityKeywords = this.priorityPatterns[priority].keywords;
    const categoryKeywords = this.categoryPatterns[category].keywords;
    
    const priorityScore = this.calculateKeywordScore(text, priorityKeywords);
    const categoryScore = this.calculateKeywordScore(text, categoryKeywords);
    
    // Normalize scores
    const maxPriorityScore = Math.max(...Object.values(this.priorityPatterns).map(p => p.keywords.length));
    const maxCategoryScore = Math.max(...Object.values(this.categoryPatterns).map(p => p.keywords.length));
    
    const normalizedPriority = priorityScore / maxPriorityScore;
    const normalizedCategory = categoryScore / maxCategoryScore;
    
    // Sentiment confidence
    const sentimentConfidence = Math.abs(sentiment) * 0.2;
    
    // Entity confidence
    const entityConfidence = Math.min(entities.length * 0.1, 0.3);
    
    return Math.min(baseConfidence + normalizedPriority * 0.3 + normalizedCategory * 0.3 + sentimentConfidence + entityConfidence, 1);
  }

  /**
   * Generate detailed NLP reasoning
   */
  private generateNLPReasoning(
    text: string, 
    priority: TaskPriority, 
    category: TaskCategory, 
    sentiment: number, 
    entities: string[], 
    timeIndicators: string[]
  ): string[] {
    const reasoning: string[] = [];
    
    // Priority reasoning
    const priorityPatterns = this.priorityPatterns[priority];
    const foundPriorityKeywords = priorityPatterns.keywords.filter(keyword => text.includes(keyword));
    if (foundPriorityKeywords.length > 0) {
      reasoning.push(`Priority set to ${priority} based on keywords: ${foundPriorityKeywords.join(', ')}`);
    }
    
    // Time urgency reasoning
    if (timeIndicators.length > 0) {
      reasoning.push(`Time urgency detected: ${timeIndicators.join(', ')}`);
    }
    
    // Sentiment reasoning
    if (Math.abs(sentiment) > 0.3) {
      const sentimentType = sentiment > 0 ? 'positive' : 'negative';
      reasoning.push(`Sentiment analysis: ${sentimentType} (score: ${sentiment.toFixed(2)})`);
    }
    
    // Category reasoning
    const categoryPatterns = this.categoryPatterns[category];
    const foundCategoryKeywords = categoryPatterns.keywords.filter(keyword => text.includes(keyword));
    if (foundCategoryKeywords.length > 0) {
      reasoning.push(`Category set to ${category} based on keywords: ${foundCategoryKeywords.join(', ')}`);
    }
    
    // Entity reasoning
    if (entities.length > 0) {
      reasoning.push(`Entities detected: ${entities.join(', ')}`);
    }
    
    // Default reasoning
    if (reasoning.length === 0) {
      reasoning.push(`Using default priority (${priority}) and category (${category})`);
    }
    
    return reasoning;
  }
}

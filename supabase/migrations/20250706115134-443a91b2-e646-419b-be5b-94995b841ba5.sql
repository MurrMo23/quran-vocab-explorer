-- Update existing content pages with actual content
UPDATE public.content_pages 
SET 
  title = 'Help & Support',
  content = 'Welcome to our Help & Support center! We''re here to assist you on your Arabic vocabulary learning journey.

<h2>Getting Started</h2>
<ul>
<li><strong>Create an Account:</strong> Sign up to track your progress and access personalized features</li>
<li><strong>Choose Your Level:</strong> Select from beginner, intermediate, or advanced vocabulary collections</li>
<li><strong>Practice Daily:</strong> Set daily goals and maintain consistent learning habits</li>
</ul>

<h2>Learning Features</h2>
<ul>
<li><strong>Vocabulary Collections:</strong> Organized word sets by difficulty and theme</li>
<li><strong>Interactive Quizzes:</strong> Test your knowledge with various question types</li>
<li><strong>Spaced Repetition:</strong> Smart review system that optimizes learning retention</li>
<li><strong>Audio Practice:</strong> Listen to pronunciation and practice speaking</li>
<li><strong>Progress Tracking:</strong> Monitor your learning journey with detailed analytics</li>
</ul>

<h2>Community Features</h2>
<ul>
<li><strong>Study Groups:</strong> Join or create groups to learn with others</li>
<li><strong>Leaderboards:</strong> Compete with fellow learners</li>
<li><strong>Forum Discussions:</strong> Ask questions and share learning tips</li>
</ul>

<h2>Technical Support</h2>
<p>Having technical issues? Here are some common solutions:</p>
<ul>
<li><strong>Audio not working:</strong> Check your browser settings and ensure microphone access is enabled</li>
<li><strong>Progress not saving:</strong> Make sure you''re logged in and have a stable internet connection</li>
<li><strong>Quiz issues:</strong> Try refreshing the page or clearing your browser cache</li>
</ul>

<h2>Contact Support</h2>
<p>Still need help? Reach out to our support team:</p>
<ul>
<li><strong>Email:</strong> support@arabicvocabulary.com</li>
<li><strong>Response Time:</strong> We typically respond within 24 hours</li>
</ul>

<h2>Learning Tips</h2>
<ul>
<li><strong>Consistency is Key:</strong> Practice a little each day rather than long sessions</li>
<li><strong>Use Multiple Senses:</strong> Read, listen, and speak to reinforce learning</li>
<li><strong>Connect with Context:</strong> Learn words in sentences and real situations</li>
<li><strong>Review Regularly:</strong> Use our spaced repetition system for optimal retention</li>
</ul>',
  excerpt = 'Get help with your Arabic vocabulary learning journey. Find answers to common questions and access support resources.',
  seo_title = 'Help & Support - Arabic Vocabulary Learning Platform',
  seo_description = 'Get help with Arabic vocabulary learning, troubleshooting guides, and support resources for mastering Quranic Arabic.',
  page_type = 'support',
  updated_at = now()
WHERE slug = 'help';

UPDATE public.content_pages 
SET 
  title = 'About Us',
  content = '<h1>About Arabic Vocabulary Learning Platform</h1>

<p>Welcome to your comprehensive Arabic vocabulary learning platform, designed specifically for students seeking to master Quranic Arabic and deepen their understanding of Islamic texts.</p>

<h2>Our Mission</h2>
<p>We believe that understanding Arabic vocabulary is the gateway to comprehending the Quran and other Islamic texts in their original language. Our mission is to make Arabic vocabulary learning accessible, engaging, and effective for Muslims worldwide.</p>

<h2>What We Offer</h2>
<ul>
<li><strong>Comprehensive Vocabulary Collections:</strong> Carefully curated word lists covering essential Quranic vocabulary, organized by difficulty and theme</li>
<li><strong>Interactive Learning Tools:</strong> Engaging quizzes, flashcards, and practice exercises designed to reinforce learning</li>
<li><strong>Smart Learning System:</strong> Advanced spaced repetition algorithms that optimize your learning schedule</li>
<li><strong>Audio Features:</strong> High-quality pronunciation guides to help you learn proper Arabic pronunciation</li>
<li><strong>Progress Tracking:</strong> Detailed analytics to monitor your learning journey and celebrate achievements</li>
<li><strong>Community Features:</strong> Connect with fellow learners through study groups and forums</li>
</ul>

<h2>Our Approach</h2>
<p>Our learning methodology is based on proven educational principles:</p>
<ul>
<li><strong>Contextual Learning:</strong> Words are taught within meaningful contexts and examples from the Quran</li>
<li><strong>Progressive Difficulty:</strong> Content is structured from beginner to advanced levels</li>
<li><strong>Multi-modal Learning:</strong> Combining visual, auditory, and kinesthetic learning styles</li>
<li><strong>Adaptive Technology:</strong> AI-powered recommendations based on your learning patterns</li>
</ul>

<h2>For Students of Islam</h2>
<p>Whether you''re a new Muslim beginning your Arabic journey, a student in an Islamic school, or someone seeking to deepen your connection with the Quran, our platform provides the tools you need to succeed.</p>

<h2>Quality & Accuracy</h2>
<p>All our content is carefully reviewed by Arabic language experts and Islamic scholars to ensure accuracy and authenticity. We''re committed to providing reliable resources for your Islamic education.</p>

<h2>Join Our Community</h2>
<p>Join thousands of learners who are already on their path to mastering Arabic vocabulary. Start your journey today and discover the beauty of the Arabic language.</p>',
  excerpt = 'Learn about our mission to make Arabic vocabulary learning accessible for students of Islam and Quranic studies.',
  seo_title = 'About Us - Arabic Vocabulary Learning Platform',
  seo_description = 'Discover our mission to help Muslims master Arabic vocabulary for better understanding of the Quran and Islamic texts.',
  page_type = 'static',
  updated_at = now()
WHERE slug = 'about';

UPDATE public.content_pages 
SET 
  title = 'Contact Us',
  content = '<h1>Contact Us</h1>

<p>We''d love to hear from you! Whether you have questions, feedback, or need support, our team is here to help.</p>

<h2>Get in Touch</h2>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3>Email Support</h3>
<p><strong>General Inquiries:</strong> info@arabicvocabulary.com<br>
<strong>Technical Support:</strong> support@arabicvocabulary.com<br>
<strong>Content & Curriculum:</strong> content@arabicvocabulary.com</p>
</div>

<h2>Response Times</h2>
<ul>
<li><strong>Technical Issues:</strong> Within 24 hours</li>
<li><strong>General Inquiries:</strong> 1-2 business days</li>
<li><strong>Content Questions:</strong> 2-3 business days</li>
</ul>

<h2>What to Include in Your Message</h2>
<p>To help us assist you better, please include:</p>
<ul>
<li>Your account email (if applicable)</li>
<li>Detailed description of your question or issue</li>
<li>Screenshots if reporting a technical problem</li>
<li>Your browser and device information for technical issues</li>
</ul>

<h2>Frequently Asked Questions</h2>
<p>Before reaching out, you might find answers in our <a href="/help">Help & Support</a> section, which covers common questions about:</p>
<ul>
<li>Account setup and management</li>
<li>Learning features and tools</li>
<li>Technical troubleshooting</li>
<li>Billing and subscription questions</li>
</ul>

<h2>Community Support</h2>
<p>Connect with other learners in our <a href="/community">Community Hub</a> where you can:</p>
<ul>
<li>Ask questions in our forums</li>
<li>Join study groups</li>
<li>Share learning tips and experiences</li>
<li>Get peer support</li>
</ul>

<h2>Feedback & Suggestions</h2>
<p>We value your input! If you have ideas for new features, content suggestions, or general feedback about your learning experience, we''d love to hear from you.</p>

<h2>Partnership & Business Inquiries</h2>
<p>For partnership opportunities, bulk licensing, or institutional use, please contact our business development team at: business@arabicvocabulary.com</p>

<h2>Social Media</h2>
<p>Stay connected with us on social media for updates, learning tips, and community highlights:</p>
<ul>
<li>Facebook: @ArabicVocabularyLearning</li>
<li>Twitter: @ArabicVocabApp</li>
<li>Instagram: @ArabicVocabulary</li>
<li>YouTube: Arabic Vocabulary Learning</li>
</ul>',
  excerpt = 'Get in touch with our support team for help with your Arabic vocabulary learning journey.',
  seo_title = 'Contact Us - Arabic Vocabulary Learning Platform',
  seo_description = 'Contact our support team for help with Arabic vocabulary learning, technical issues, and general inquiries.',
  page_type = 'static',
  updated_at = now()
WHERE slug = 'contact';

UPDATE public.content_pages 
SET 
  title = 'Privacy Policy',
  content = '<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> ' || CURRENT_DATE || '</p>

<h2>Introduction</h2>
<p>At Arabic Vocabulary Learning Platform ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

<h2>Information We Collect</h2>

<h3>Personal Information</h3>
<p>We may collect personal information that you provide directly to us, including:</p>
<ul>
<li>Email address</li>
<li>Name and profile information</li>
<li>Learning preferences and settings</li>
<li>Progress and performance data</li>
<li>Communication records</li>
</ul>

<h3>Automatically Collected Information</h3>
<p>When you use our services, we may automatically collect:</p>
<ul>
<li>Device information (browser type, operating system)</li>
<li>Usage data (pages visited, time spent, features used)</li>
<li>IP address and location information</li>
<li>Cookies and similar tracking technologies</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the collected information to:</p>
<ul>
<li>Provide and maintain our learning platform</li>
<li>Personalize your learning experience</li>
<li>Track your progress and performance</li>
<li>Send you important updates and notifications</li>
<li>Improve our services and develop new features</li>
<li>Provide customer support</li>
<li>Ensure security and prevent fraud</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
<ul>
<li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
<li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
<li><strong>Business Transfers:</strong> In connection with a merger, sale, or other business transaction</li>
<li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate information</li>
<li>Delete your account and associated data</li>
<li>Opt-out of marketing communications</li>
<li>Data portability</li>
</ul>

<h2>Cookies</h2>
<p>We use cookies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser.</p>

<h2>Children''s Privacy</h2>
<p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13 without parental consent.</p>

<h2>International Data Transfers</h2>
<p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>

<h2>Contact Information</h2>
<p>If you have questions about this Privacy Policy, please contact us at:</p>
<ul>
<li>Email: privacy@arabicvocabulary.com</li>
<li>Website: <a href="/contact">Contact Us</a></li>
</ul>',
  excerpt = 'Learn how we protect your privacy and handle your personal information on our Arabic vocabulary learning platform.',
  seo_title = 'Privacy Policy - Arabic Vocabulary Learning Platform',
  seo_description = 'Read our privacy policy to understand how we collect, use, and protect your personal information while learning Arabic vocabulary.',
  page_type = 'legal',
  updated_at = now()
WHERE slug = 'privacy-policy';

UPDATE public.content_pages 
SET 
  title = 'Terms of Service',
  content = '<h1>Terms of Service</h1>
<p><strong>Last updated:</strong> ' || CURRENT_DATE || '</p>

<h2>Agreement to Terms</h2>
<p>By accessing and using Arabic Vocabulary Learning Platform ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.</p>

<h2>Description of Service</h2>
<p>Arabic Vocabulary Learning Platform is an educational service designed to help users learn Arabic vocabulary, particularly for understanding Quranic and Islamic texts. The Service includes interactive lessons, quizzes, progress tracking, and community features.</p>

<h2>User Accounts</h2>
<ul>
<li>You must create an account to access certain features</li>
<li>You are responsible for maintaining the confidentiality of your account</li>
<li>You must provide accurate and complete information</li>
<li>You are responsible for all activities under your account</li>
<li>You must be at least 13 years old to create an account</li>
</ul>

<h2>Acceptable Use</h2>
<p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
<ul>
<li>Use the Service for any illegal or unauthorized purpose</li>
<li>Harass, abuse, or harm other users</li>
<li>Share inappropriate or offensive content</li>
<li>Attempt to hack, disrupt, or interfere with the Service</li>
<li>Share your account credentials with others</li>
<li>Copy, distribute, or modify our content without permission</li>
</ul>

<h2>Content and Intellectual Property</h2>
<ul>
<li>All content on the platform is owned by us or our licensors</li>
<li>You may use the content for personal, non-commercial learning purposes</li>
<li>You retain ownership of content you create (notes, forum posts)</li>
<li>By posting content, you grant us a license to use it on the platform</li>
</ul>

<h2>Privacy</h2>
<p>Your privacy is important to us. Please review our <a href="/privacy-policy">Privacy Policy</a> to understand how we collect and use your information.</p>

<h2>Payments and Subscriptions</h2>
<ul>
<li>Some features may require payment or subscription</li>
<li>All fees are non-refundable unless required by law</li>
<li>We may change pricing with reasonable notice</li>
<li>Subscriptions automatically renew unless cancelled</li>
</ul>

<h2>Service Availability</h2>
<ul>
<li>We strive to maintain service availability but cannot guarantee 100% uptime</li>
<li>We may temporarily suspend service for maintenance</li>
<li>We reserve the right to modify or discontinue features</li>
</ul>

<h2>User-Generated Content</h2>
<ul>
<li>You are responsible for content you post on forums and community features</li>
<li>We may remove content that violates these Terms</li>
<li>You grant us permission to use your contributions to improve the Service</li>
</ul>

<h2>Disclaimers</h2>
<ul>
<li>The Service is provided "as is" without warranties</li>
<li>We do not guarantee learning outcomes or results</li>
<li>Educational content is for informational purposes</li>
<li>We are not responsible for user-generated content</li>
</ul>

<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>

<h2>Termination</h2>
<ul>
<li>You may terminate your account at any time</li>
<li>We may suspend or terminate accounts for violations of these Terms</li>
<li>Upon termination, your right to use the Service ceases immediately</li>
</ul>

<h2>Changes to Terms</h2>
<p>We may modify these Terms at any time. We will provide notice of material changes. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

<h2>Governing Law</h2>
<p>These Terms are governed by and construed in accordance with applicable laws. Any disputes will be resolved through binding arbitration.</p>

<h2>Contact Information</h2>
<p>For questions about these Terms of Service, please contact us at:</p>
<ul>
<li>Email: legal@arabicvocabulary.com</li>
<li>Website: <a href="/contact">Contact Us</a></li>
</ul>

<h2>Severability</h2>
<p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>',
  excerpt = 'Read our terms of service to understand the rules and guidelines for using our Arabic vocabulary learning platform.',
  seo_title = 'Terms of Service - Arabic Vocabulary Learning Platform',
  seo_description = 'Review our terms of service, user agreements, and guidelines for using our Arabic vocabulary learning platform.',
  page_type = 'legal',
  updated_at = now()
WHERE slug = 'terms-of-service';
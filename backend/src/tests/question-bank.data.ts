import { CefrLevel } from '../common/interfaces/test-result.interface';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionBankItem {
  id: string;
  number?: number;
  text: string;
  type: 'multiple-choice' | 'open-text' | 'speaking';
  skill: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking';
  targetLevel: CefrLevel;
  correctAnswer?: string;
  options?: QuestionOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RAW 1000 MULTIPLE-CHOICE QUESTIONS (A1 → C2)
// A1 (1–170) · A2 (171–340) · B1 (341–510) · B2 (511–680) · C1 (681–840) · C2 (841–1000)
// ─────────────────────────────────────────────────────────────────────────────
const RAW_1000_QUESTIONS = `
1. I ___ a student. a) is b) am c) are d) be → b
2. She ___ my sister. a) am b) are c) is d) be → c
3. They ___ from Egypt. a) is b) am c) are d) be → c
4. He ___ a doctor. a) are b) is c) am d) be → b
5. We ___ good friends. a) are b) is c) am d) be → a
6. ___ name is Ahmed. a) I b) Me c) Mine d) My → d
7. What ___ your name? a) are b) is c) do d) am → b
8. 'How are you?' – '___' a) My name is Sara. b) I'm twenty. c) I'm fine, thanks. d) Yes, I am. → c
9. Which word is a color? a) table b) green c) run d) happy → b
10. Which is the number 5? a) four b) six c) three d) five → d
11. The day after Monday is ___. a) Sunday b) Tuesday c) Friday d) Wednesday → b
12. The opposite of 'big' is ___. a) small b) tall c) long d) old → a
13. I have ___ apple and a banana. a) a b) an c) some d) two → b
14. She has ___ book. a) an b) a c) many d) are → b
15. The plural of 'cat' is ___. a) cates b) cats c) cat's d) cati → b
16. The plural of 'box' is ___. a) boxs b) box c) boxes d) boxies → c
17. The plural of 'child' is ___. a) childs b) childes c) children d) childrens → c
18. ___ is my book. (near me) a) These b) Those c) That d) This → d
19. Where ___ you from? a) is b) are c) am d) does → b
20. 'Hello' is used to ___. a) say goodbye b) say thank you c) say sorry d) greet someone → d
21. 'Good morning' is said in the ___. a) morning b) evening c) night d) afternoon → a
22. I ___ tea every day. a) drinks b) drinking c) drink d) drinked → c
23. He ___ football on Fridays. a) play b) plays c) playing d) is play → b
24. She ___ English. a) don't speak b) doesn't speak c) doesn't speaks d) not speak → b
25. They ___ like coffee. a) doesn't b) isn't c) don't d) aren't → c
26. ___ you like pizza? a) Are b) Do c) Does d) Is → b
27. ___ she work in a bank? a) Do b) Is c) Does d) Are → c
28. 'Do you like milk?' – 'Yes, I ___.' a) am b) does c) do d) like → c
29. 'Does he live here?' – 'No, he ___.' a) don't b) doesn't c) isn't d) not → b
30. My mother's brother is my ___. a) uncle b) cousin c) father d) grandfather → a
31. Father + mother = ___. a) friends b) parents c) children d) teachers → b
32. My father's father is my ___. a) uncle b) brother c) grandfather d) son → c
33. A place where we study: a) hospital b) school c) market d) bank → b
34. We use a pen to ___. a) write b) eat c) sleep d) drive → a
35. We eat soup with a ___. a) knife b) fork c) spoon d) plate → c
36. Water is a ___. a) food b) drink c) color d) animal → b
37. A dog is an ___. a) animal b) fruit c) color d) number → a
38. Which is a fruit? a) potato b) onion c) banana d) bread → c
39. Which is a vegetable? a) apple b) carrot c) orange d) grape → b
40. 3 + 4 = ___ a) six b) eight c) seven d) five → c
41. 10 − 4 = ___ a) five b) six c) seven d) four → b
42. The month after January is ___. a) March b) December c) February d) April → c
43. How many days are in a week? a) five b) seven c) six d) ten → b
44. It's 3:00. It's ___ o'clock. a) two b) four c) three d) five → c
45. I get up ___ 7 o'clock. a) in b) on c) at d) to → c
46. The book is ___ the table. a) in b) on c) at d) of → b
47. The cat is ___ the box. (inside) a) on b) in c) at d) from → b
48. He lives ___ Cairo. a) at b) on c) in d) to → c
49. I go to school ___ bus. a) on b) in c) with d) by → d
50. School starts ___ Sunday. a) in b) at c) on d) to → c
51. She is ___ home now. a) in b) at c) on d) to → b
52. There ___ a book on the desk. a) are b) is c) am d) be → b
53. There ___ three chairs in the room. a) is b) am c) are d) be → c
54. 'Is there a bank near here?' – 'Yes, ___.' a) there is b) there are c) it is d) I am → a
55. I ___ swim. a) can b) cans c) can to d) are → a
56. She ___ drive a car. (she doesn't know how) a) can't b) don't c) isn't d) can't to → a
57. ___ you speak Arabic? a) Are b) Is c) Can d) Am → c
58. What ___ this? a) are b) is c) do d) am → b
59. Who ___ they? a) is b) am c) are d) do → c
60. ___ is your birthday? a) Who b) When c) Where d) Why → b
61. ___ do you live? a) When b) Where c) Who d) What → b
62. ___ is that man? a) Where b) What c) Who d) Why → c
63. ___ old are you? a) How b) What c) Who d) Where → a
64. ___ is this shirt? (price) a) How much b) How many c) How old d) How long → a
65. ___ apples do you want? a) How much b) How many c) How long d) How old → b
66. He is ___ brother. (I) a) I b) me c) my d) mine → c
67. This is Sara. ___ is my friend. a) He b) She c) It d) They → b
68. Ahmed and Ali are students. ___ are in my class. a) We b) He c) They d) It → c
69. I like Sara. I talk to ___. a) she b) her c) hers d) he → b
70. This is a dog. ___ is brown. a) They b) She c) It d) We → c
71. Give ___ the book, please. a) I b) my c) me d) mine → c
72. This is Tom's car. It's ___ car. a) her b) its c) their d) his → d
73. We love ___ teacher. a) our b) we c) us d) ours → a
74. I ___ breakfast at 8. a) has b) have c) having d) haves → b
75. She ___ a new phone. a) have b) haves c) has d) having → c
76. The opposite of 'hot' is ___. a) warm b) cold c) sunny d) dry → b
77. The opposite of 'happy' is ___. a) sad b) glad c) nice d) good → a
78. The opposite of 'open' is ___. a) start b) close c) clean d) give → b
79. The opposite of 'old' (for a car) is ___. a) young b) new c) tall d) low → b
80. The opposite of 'up' is ___. a) left b) over c) down d) out → c
81. 'Thank you.' – '___' a) Sorry. b) You're welcome. c) Goodbye. d) Excuse me. → b
82. To pass someone politely, you say ___. a) Excuse me b) Thank you c) Good night d) Welcome → a
83. 'Goodbye' means ___. a) hello b) thanks c) see you later d) please → c
84. 'Nice to meet you.' – '___' a) Fine. b) Nice to meet you, too. c) Yes, please. d) No, thanks. → b
85. A room where we cook: a) bedroom b) kitchen c) bathroom d) garden → b
86. A room where we sleep: a) bedroom b) kitchen c) garden d) garage → a
87. We take a shower in the ___. a) kitchen b) bathroom c) garage d) garden → b
88. A person who teaches: a) doctor b) driver c) teacher d) farmer → c
89. A person who treats sick people: a) pilot b) doctor c) cook d) singer → b
90. A person who flies a plane: a) pilot b) police officer c) nurse d) waiter → a
91. Which one is a day? a) July b) Friday c) winter d) noon → b
92. Which is a season? a) summer b) Sunday c) May d) morning → a
93. It's ___ today. Take an umbrella. a) sunny b) rainy c) hot d) dry → b
94. It's winter. It's ___. a) hot b) cold c) green d) dry → b
95. I wear ___ on my feet. a) shoes b) gloves c) a hat d) a scarf → a
96. I wear ___ on my head. a) socks b) shoes c) a hat d) a belt → c
97. We see with our ___. a) ears b) eyes c) hands d) nose → b
98. We hear with our ___. a) ears b) eyes c) mouth d) legs → a
99. I have two ___. a) hand b) hands c) handes d) handies → b
100. She has long ___. a) hair b) hairs c) hairy d) hairies → a
101. My phone is ___ the bag. (inside) a) at b) in c) from d) on → b
102. The shop is ___ the bank and the school. a) between b) under c) next d) at → a
103. The school is ___ to the park. a) next b) at c) in d) between → a
104. Go ___ and turn left. a) straight b) between c) under d) across → a
105. The opposite of 'left' is ___. a) right b) up c) back d) down → a
106. I'm hungry. I want to ___. a) eat b) sleep c) run d) read → a
107. I'm thirsty. I want some ___. a) bread b) water c) rice d) meat → b
108. I'm tired. I want to ___. a) sleep b) swim c) play d) run → a
109. He has a cold. He is ___. a) sick b) fast c) rich d) tall → a
110. Which word is a verb? a) happy b) table c) run d) red → c
111. Which word is a noun? a) quickly b) book c) big d) go → b
112. Which word is an adjective? a) beautiful b) walk c) city d) they → a
113. I ___ not tired. a) is b) am c) are d) be → b
114. ___ he a teacher? a) Are b) Am c) Is d) Do → c
115. The children ___ in the garden. a) is b) am c) are d) be → c
116. My keys ___ on the table. a) is b) are c) am d) be → b
117. 'Is she your sister?' – 'No, she ___.' a) isn't b) aren't c) doesn't d) don't → a
118. 'Are you a student?' – 'Yes, I ___.' a) is b) am c) are d) do → b
119. I ___ from Spain. I'm from Egypt. a) am b) isn't c) aren't d) am not → d
120. We ___ at home. We're at school. a) isn't b) aren't c) don't d) not → b
121. Which is correct? a) She like tea. b) She likes tea. c) She liking tea. d) She do like tea. → b
122. Which is correct? a) I am 20 years old. b) I have 20 years. c) I'm 20 year. d) I am have 20. → a
123. Which is correct? a) He go to work. b) He goes to work. c) He going to work. d) He gos to work. → b
124. Which is correct? a) They is happy. b) They am happy. c) They are happy. d) They be happy. → c
125. Which is correct? a) Where you live? b) Where do you live? c) Where does you live? d) Where live you? → b
126. Which is correct? a) She don't like fish. b) She doesn't likes fish. c) She doesn't like fish. d) She not like fish. → c
127. Which is correct? a) a umbrella b) an umbrella c) umbrella a d) an umbrellas → b
128. Which is correct? a) a hour b) an hour c) an hours d) a hours → b
129. Which is correct? a) an university b) a university c) an universitys d) university a → b
130. Which is correct? a) two book b) two books c) two bookes d) twos books → b
131. How do you say 12? a) twenty b) two c) twelve d) twelfth → c
132. How do you say 20? a) twelve b) twenty c) twentieth d) twety → b
133. The number 1st is read as ___. a) one b) first c) once d) won → b
134. 2nd = ___. a) second b) twice c) two d) twos → a
135. 100 = ___. a) a hundred b) a thousand c) ten d) a million → a
136. 'Half past six' = ___. a) 6:15 b) 6:45 c) 6:30 d) 5:30 → c
137. 'Quarter past two' = ___. a) 2:15 b) 2:45 c) 1:45 d) 2:30 → a
138. Which is the morning meal? a) dinner b) lunch c) breakfast d) supper → c
139. We have lunch at ___. a) midnight b) noon c) dawn d) 5 a.m. → b
140. The first month of the year is ___. a) January b) March c) June d) December → a
141. 'Do you have a pen?' – '___' a) Yes, I do. b) Yes, I have. c) Yes, I am. d) Yes, I does. → a
142. 'Is this your bag?' – '___' a) Yes, it is. b) Yes, this is. c) Yes, it does. d) Yes, I is. → a
143. 'What do you do?' – 'I'm a ___.' a) teaching b) teacher c) teach d) teachs → b
144. 'Where's Ali?' – 'He's ___ the kitchen.' a) in b) on c) at d) to → a
145. 'What time do you get up?' – '___' a) Yes, I do. b) At six. c) By bus. d) In Cairo. → b
146. 'How much is this?' – '___' a) It's ten pounds. b) It's tall. c) I'm ten. d) Ten years. → a
147. 'Can I help you?' – '___' a) Yes, I can. b) Yes, please. c) You're welcome. d) Good luck. → b
148. 'Would you like some tea?' – '___' a) Yes, I am. b) No, thank you. c) You're welcome. d) Goodbye. → b
149. 'Happy birthday!' – '___' a) Thank you! b) Good luck! c) Sorry! d) Please! → a
150. 'I'm sorry.' – '___' a) That's all right. b) Thank you. c) Please. d) Good morning. → a
151. Mona ___ to the market on Saturdays. a) go b) goes c) going d) is go → b
152. My friends ___ in London. a) lives b) live c) living d) is live → b
153. The baby ___ a lot. a) sleep b) sleeps c) sleeping d) sleepes → b
154. He ___ his teeth every morning. a) brush b) brushs c) brushes d) brushing → c
155. She ___ TV in the evening. a) watch b) watchs c) watches d) watching → c
156. My father ___ a car. a) have b) haves c) has d) having → c
157. I ___ coffee. I prefer tea. a) don't like b) doesn't like c) not like d) am not like → a
158. We ___ at the weekend. a) doesn't work b) don't works c) don't work d) not work → c
159. Look! The boy ___. a) runs b) is running c) run d) running → b
160. I ___ a book now. a) read b) am reading c) reads d) reading → b
161. They ___ football now. a) play b) plays c) are playing d) playing → c
162. ___ you eating? a) Do b) Are c) Is d) Does → b
163. It ___ today. (it's happening now) a) rains b) is raining c) rain d) raining → b
164. She ___ a letter at the moment. a) writes b) write c) is writing d) writing → c
165. Which word means 'very big'? a) tiny b) huge c) short d) thin → b
166. Which word means 'very small'? a) huge b) tall c) tiny d) wide → c
167. The opposite of 'fast' is ___. a) quick b) slow c) high d) loud → b
168. The opposite of 'clean' is ___. a) dirty b) cheap c) easy d) light → a
169. The opposite of 'easy' is ___. a) hard b) cheap c) near d) full → a
170. The opposite of 'full' is ___. a) empty b) heavy c) near d) late → a
171. Yesterday I ___ to the cinema. a) go b) goes c) went d) going → c
172. She ___ her homework last night. a) do b) did c) done d) does → b
173. We ___ a great film last week. a) see b) seen c) saw d) sees → c
174. He ___ a new car in 2020. a) buyed b) buy c) bought d) buys → c
175. They ___ at home yesterday. (negative) a) don't b) didn't be c) weren't d) aren't → c
176. ___ you watch the match last night? a) Do b) Did c) Were d) Are → b
177. I ___ sleep well last night. a) don't b) didn't c) wasn't d) not → b
178. The past of 'eat' is ___. a) eated b) ate c) eaten d) eats → b
179. The past of 'write' is ___. a) writed b) writen c) wrote d) writes → c
180. The past of 'come' is ___. a) came b) comed c) comes d) coming → a
181. The past of 'have' is ___. a) haved b) has c) had d) having → c
182. The past of 'study' is ___. a) studyed b) studied c) studdied d) studys → b
183. The past of 'stop' is ___. a) stoped b) stopt c) stopped d) stoping → c
184. When ___ you arrive? a) do b) did c) are d) does → b
185. I ___ my keys yesterday. a) losed b) lose c) lost d) loosed → c
186. She is ___ than her brother. (tall) a) tall b) taller c) tallest d) more tall → b
187. This book is ___ than that one. (interesting) a) interestinger b) more interesting c) most interesting d) interesting → b
188. Cairo is ___ city in Egypt. (big) a) bigger b) the bigger c) the biggest d) biggest → c
189. Today is ___ than yesterday. (hot) a) hoter b) hotter c) hotest d) more hot → b
190. My car is ___ than yours. (good) a) gooder b) more good c) better d) best → c
191. He is the ___ student in class. (good) a) better b) best c) goodest d) most good → b
192. This is the ___ film I've ever seen. (bad) a) worse b) baddest c) worst d) worse than → c
193. A bike is ___ than a car. (cheap) a) cheaper b) more cheap c) cheapest d) the cheaper → a
194. She is as tall ___ me. a) than b) as c) like d) that → b
195. Which is correct? a) more easy b) easier c) easyer d) most easy → b
196. I'm going to ___ my grandmother tomorrow. a) visit b) visited c) visits d) visiting → a
197. I think it ___ rain later. a) will b) wills c) is will d) willing → a
198. I think she ___ pass the exam. a) will b) is c) does d) has → a
199. We ___ travel next month. (maybe) a) might b) did c) were d) are → a
200. 'I'm cold.' – 'I ___ close the window.' a) will b) am going to c) close d) closed → a
201. We ___ a party on Saturday. (already arranged) a) have b) are having c) had d) has → b
202. What are you ___ to do this weekend? a) go b) going c) goes d) went → b
203. Look at those clouds! It ___ rain. a) will b) is going to c) rains d) rained → b
204. Is he ___ to come? a) go b) going c) goes d) went → b
205. He ___ to study hard. (necessity) a) must b) has c) have d) having → b
206. You ___ wear a seat belt in the car. a) must b) can c) may d) might → a
207. You ___ smoke here. (it's forbidden) a) mustn't b) don't have to c) can d) should → a
208. You ___ pay. It's free. a) mustn't b) don't have to c) can't d) shouldn't → b
209. You ___ see a doctor. You look ill. a) should b) shouldn't c) can't d) mustn't → a
210. You ___ eat so much sugar. a) should b) shouldn't c) will d) can → b
211. ___ I borrow your pen, please? a) Could b) Would c) Must d) Should → a
212. ___ you help me, please? a) Could b) Must c) Did d) Am → a
213. Would you like ___ coffee? a) any b) some c) a d) many → b
214. Are there ___ eggs in the fridge? a) some b) any c) a d) much → b
215. There isn't ___ milk. a) any b) many c) a d) an → a
216. How ___ sugar do you want? a) many b) much c) lot d) few → b
217. How ___ students are in the class? a) much b) many c) lot d) little → b
218. We have only ___ rice left. a) a few b) a little c) many d) few → b
219. I have only ___ friends here. a) a little b) much c) a few d) any → c
220. Which is uncountable? a) chair b) water c) egg d) car → b
221. She ___ eats breakfast. (every day) a) never b) always c) rarely d) seldom → b
222. I ___ go to the gym. (once a year) a) always b) usually c) hardly ever d) often → c
223. Which is correct? a) He always is late. b) He is always late. c) He is late always. d) Always he is late. → b
224. We ___ play tennis on Sundays. (frequently) a) often b) never c) hardly d) seldom → a
225. How ___ do you visit your parents? a) long b) often c) far d) much → b
226. I sleep ___ night. a) in b) on c) at d) by → c
227. My birthday is ___ June. a) on b) at c) in d) to → c
228. The party is ___ 5 May. a) in b) on c) at d) to → b
229. The film starts ___ 8 p.m. a) in b) on c) at d) to → c
230. I live ___ a small flat. a) at b) in c) on d) to → b
231. She's ___ the bus stop. a) at b) in c) on d) to → a
232. He walked ___ the road. (to the other side) a) across b) between c) at d) in → a
233. The plane flew ___ the clouds. (higher than) a) above b) at c) between d) beside → a
234. He is sitting ___ me. (next to) a) beside b) between c) among d) through → a
235. We arrived ___ the airport at noon. a) at b) in c) on d) to → a
236. He is good ___ maths. a) in b) at c) on d) of → b
237. I'm interested ___ music. a) on b) at c) in d) of → c
238. She is afraid ___ dogs. a) from b) of c) at d) with → b
239. I'm waiting ___ my friend. a) to b) at c) for d) of → c
240. Listen ___ me, please. a) to b) at c) for d) of → a
241. Look ___ the picture. a) to b) at c) for d) on → b
242. I'm looking ___ my keys. (searching) a) at b) for c) after d) on → b
243. Please turn ___ the light. (make it work) a) on b) off c) up d) at → a
244. Please turn ___ the TV. I'm sleeping. a) on b) in c) off d) to → c
245. Stand ___, please. (rise) a) up b) on c) at d) in → a
246. Sit ___, please. a) down b) up c) on d) at → a
247. Put ___ your coat. It's cold. a) on b) in c) at d) to → a
248. Take ___ your shoes. a) on b) off c) at d) to → b
249. I get ___ at 7 a.m. a) on b) up c) down d) in → b
250. Come ___! The door is open. a) in b) on c) at d) to → a
251. This is the girl ___ lives next door. a) who b) which c) what d) whose → a
252. A pen is a thing ___ we write with. a) who b) which c) where d) whose → b
253. That's the shop ___ I bought my shoes. a) which b) who c) where d) when → c
254. ___ bag is this? a) Who b) Whose c) Who's d) Which → b
255. I don't know ___ he lives. a) where b) who c) why d) when → a
256. What's the weather ___? a) like b) likes c) liking d) alike → a
257. I like ___ football. a) play b) playing c) plays d) played → b
258. She enjoys ___ books. a) read b) reads c) reading d) to reading → c
259. I want ___ a doctor. a) be b) to be c) being d) been → b
260. He can't ___ the answer. a) finds b) find c) finding d) to find → b
261. Let's ___ to the beach. a) go b) goes c) to go d) going → a
262. Why ___ we have lunch together? a) not b) don't c) aren't d) didn't → b
263. I'm tired ___ I worked all day. a) because b) so c) but d) or → a
264. It was late, ___ I went home. a) because b) so c) but d) or → b
265. I like tea, ___ I don't like coffee. a) so b) because c) but d) and → c
266. Do you want tea ___ coffee? a) and b) or c) but d) so → b
267. 'What's the matter?' means ___. a) What's the time? b) What's the problem? c) What's your job? d) What's your name? → b
268. 'How long does it take?' asks about ___. a) price b) distance c) time d) size → c
269. 'How far is it?' asks about ___. a) distance b) time c) price d) age → a
270. You buy a train ticket at the ___. a) station b) library c) bakery d) pharmacy → a
271. I have ___ been to Paris. (no experience) a) ever b) never c) yet d) already → b
272. Have you ___ eaten sushi? a) ever b) never c) yet d) since → a
273. She has ___ finished her homework. (a moment ago) a) just b) ever c) never d) since → a
274. I haven't seen him ___. a) already b) just c) yet d) ago → c
275. They have lived here ___ 2015. a) for b) since c) ago d) during → b
276. We've known each other ___ five years. a) since b) for c) ago d) from → b
277. He ___ his key. He can't open the door. a) loses b) has lost c) is losing d) lose → b
278. I ___ my lunch already. a) have eaten b) eat c) am eating d) eaten → a
279. 'Have you finished?' – 'Yes, I ___.' a) did b) have c) am d) has → b
280. The past participle of 'see' is ___. a) saw b) seen c) seed d) sees → b
281. The past participle of 'go' is ___. a) went b) goed c) gone d) going → c
282. The past participle of 'take' is ___. a) took b) taked c) taken d) taking → c
283. The past participle of 'do' is ___. a) did b) done c) doed d) does → b
284. I was ___ TV when he called. a) watch b) watching c) watched d) watches → b
285. While she ___, the phone rang. a) cooks b) cooked c) was cooking d) cooking → c
286. It was raining, ___ we stayed inside. a) so b) but c) because d) or → a
287. When I arrived, they ___ dinner. a) have b) were having c) having d) has → b
288. There ___ a big party last night. a) is b) are c) was d) were → c
289. There ___ many people at the shop yesterday. a) was b) were c) is d) are → b
290. I was born ___ 1998. a) on b) at c) in d) by → c
291. A person from Egypt is ___. a) Egypt b) Egyptian c) Egyptic d) Egyptish → b
292. A person from Italy is ___. a) Italian b) Italish c) Italic d) Italyan → a
293. The language of France is ___. a) France b) Frenchy c) French d) Franch → c
294. 'Cheap' means ___. a) costs a lot b) costs little c) very old d) very big → b
295. 'Expensive' means ___. a) costs a lot b) costs little c) very small d) not new → a
296. I need a ___ to buy medicine. a) bakery b) pharmacy c) library d) museum → b
297. We borrow books from a ___. a) library b) bakery c) cinema d) zoo → a
298. We buy bread at a ___. a) bakery b) bank c) hotel d) post office → a
299. We stay at a ___ when we travel. a) hotel b) school c) pharmacy d) stadium → a
300. A ___ takes people by air. a) bus b) train c) plane d) boat → c
301. The ___ shows the time. a) clock b) key c) mirror d) bed → a
302. I have a headache. I should take a ___. a) holiday b) tablet c) photo d) ticket → b
303. I have a toothache. I should see a ___. a) dentist b) driver c) lawyer d) waiter → a
304. 'Could I have the bill, please?' – you say this in a ___. a) restaurant b) library c) school d) bank → a
305. 'I'd like a single room.' – you say this at a ___. a) hotel b) cinema c) bakery d) gym → a
306. 'A return ticket' means ___. a) one way b) go and come back c) free d) expired → b
307. 'Check-in' is done at the ___. a) airport b) kitchen c) classroom d) garden → a
308. We use a ___ to take photos. a) camera b) fork c) key d) towel → a
309. You can't ___ the exam if you don't study. a) pass b) pas c) passed d) passing → a
310. I need to ___ the dishes. a) make b) do c) have d) take → b
311. Which is correct? a) I made my bed. b) I did my bed. c) I took my bed. d) I had my bed. → a
312. I ___ a shower every morning. a) make b) do c) take d) put → c
313. Let's ___ a break. a) take b) do c) make d) put → a
314. 'What does he look like?' asks about ___. a) job b) appearance c) hobby d) age → b
315. 'What is he like?' asks about ___. a) personality b) price c) time d) place → a
316. She is very ___. She always helps everyone. a) kind b) lazy c) rude d) shy → a
317. He doesn't like talking to people. He's ___. a) shy b) funny c) loud d) rich → a
318. A person who doesn't like working is ___. a) lazy b) kind c) brave d) clever → a
319. I always ___ my teeth before bed. a) wash b) clean c) brush d) comb → c
320. My uncle's son is my ___. a) brother b) cousin c) nephew d) grandson → b
321. 'Whose' asks about ___. a) place b) time c) possession d) reason → c
322. She is ___ than me. (young) a) young b) younger c) youngest d) more young → b
323. This is the ___ day of my life. (happy) a) happier b) happiest c) most happy d) happy → b
324. A kilometre is ___ than a metre. a) long b) longer c) longest d) more long → b
325. The weather is ___ in summer than in winter. a) hot b) hotter c) hottest d) more hotter → b
326. 'Was the film good?' – 'Yes, it was ___.' a) great b) greatly c) a great d) greats → a
327. He speaks English very ___. a) good b) well c) best d) goodly → b
328. She drives ___. a) careful b) carefully c) care d) carefuly → b
329. He is a ___ driver. a) slowly b) slow c) slower d) slowness → b
330. The test was very ___. I got 100%. a) easy b) hardly c) slowly d) badly → a
331. I have ___ to tell you. a) something b) somewhere c) somebody d) some → a
332. I don't know ___ here. a) anyone b) someone c) everyone d) no one → a
333. ___ is at the door. I can hear a knock. a) Someone b) Anyone c) Nothing d) Nowhere → a
334. There's ___ in the box. It's empty. a) nothing b) something c) everything d) anything → a
335. I looked ___, but I couldn't find my phone. a) everywhere b) nowhere c) anywhere d) somewhere → a
336. We ___ to the same school. a) go b) goes c) going d) gone → a
337. What ___ you do last weekend? a) do b) did c) are d) have → b
338. Where ___ you born? a) did b) do c) were d) are → c
339. How ___ do you study every day? a) many b) long c) far d) tall → b
340. 'Would you like to come to my party?' – 'Yes, I'd ___ to.' a) loves b) love c) loved d) loving → b
341. If it rains, we ___ at home. a) stay b) will stay c) stayed d) would stay → b
342. If I ___ rich, I would buy a big house. a) am b) were c) will be d) have been → b
343. If you heat ice, it ___. a) melts b) will melted c) melted d) would melt → a
344. What would you do if you ___ a million dollars? a) win b) won c) will win d) have won → b
345. I'll call you when I ___ home. a) get b) will get c) got d) getting → a
346. Unless you hurry, you ___ miss the bus. a) will b) won't c) would d) don't → a
347. He asked me where I ___. a) live b) lived c) am living d) have lived → b
348. She said she ___ tired. a) is b) was c) be d) has been → b
349. 'I'll help you,' he said. → He said he ___ help me. a) will b) would c) can d) did → b
350. 'Do you like tea?' → She asked me if I ___ tea. a) like b) liked c) liking d) likes → b
351. The window ___ by a boy. (break) a) broke b) was broken c) is broke d) has break → b
352. English ___ all over the world. a) speaks b) is spoken c) spoke d) is speaking → b
353. The cake ___ by my mother yesterday. a) made b) was made c) is made d) makes → b
354. This house ___ in 1990. a) built b) was built c) is built d) has built → b
355. A new bridge ___ next year. a) will build b) will be built c) is building d) builds → b
356. The letters ___ yet. a) haven't been sent b) didn't sent c) haven't sent d) aren't send → a
357. I ___ here for two hours. a) wait b) am waiting c) have been waiting d) waited → c
358. She ___ English since 2018. a) studies b) has been studying c) studied d) is study → b
359. How long ___ you ___ here? a) did / live b) have / lived c) are / living d) do / live → b
360. I ___ play football when I was a child. a) use to b) used to c) using to d) am used → b
361. She didn't ___ to like spicy food. a) used b) use c) using d) uses → b
362. I'm used ___ early. a) to get up b) to getting up c) get up d) getting up → b
363. He's getting used ___ in a big city. a) to live b) to living c) live d) living → b
364. I'm looking forward ___ you. a) to see b) to seeing c) seeing d) see → b
365. She suggested ___ to the cinema. a) to go b) going c) go d) went → b
366. I decided ___ a new job. a) finding b) to find c) find d) found → b
367. He avoids ___ meat. a) to eat b) eating c) eat d) eaten → b
368. I can't stand ___ in queues. a) wait b) waiting c) waited d) waits → b
369. My parents let me ___ out late. a) to stay b) stay c) staying d) stayed → b
370. She made me ___. a) laugh b) to laugh c) laughing d) laughed → a
371. He's too young ___ a car. a) drive b) to drive c) driving d) for drive → b
372. She isn't old ___ to vote. a) enough b) too c) very d) so → a
373. It was ___ a good film that I saw it twice. a) so b) such c) too d) very → b
374. The film was ___ boring that I fell asleep. a) such b) so c) too d) very → b
375. 'You're tired, ___ you?' a) are b) aren't c) don't d) isn't → b
376. 'She can swim, ___ she?' a) can b) can't c) doesn't d) isn't → b
377. 'They didn't come, ___ they?' a) did b) didn't c) do d) were → a
378. 'Let's go, ___ we?' a) will b) shall c) don't d) do → b
379. She might ___ late. a) is b) be c) being d) been → b
380. He ___ be at home. The lights are on. a) must b) can't c) mustn't d) shouldn't → a
381. That ___ be true! It's impossible. a) must b) can't c) may d) should → b
382. You ___ have told me earlier. (it was a mistake not to) a) should b) must c) can d) will → a
383. I wish I ___ more free time. a) have b) had c) will have d) having → b
384. I wish it ___ summer now. a) is b) were c) will be d) was been → b
385. I'd rather ___ at home tonight. a) stay b) to stay c) staying d) stayed → a
386. He's the man ___ car was stolen. a) who b) whose c) which d) whom → b
387. The book ___ I bought is great. a) who b) whose c) which d) where → c
388. The city ___ I was born is small. a) where b) which c) who d) whose → a
389. She is a teacher, ___ is why she knows a lot. a) that b) which c) what d) who → b
390. I met a man ___ speaks five languages. a) which b) who c) whose d) where → b
391. She is ___ intelligent girl. a) a b) an c) the d) no article → b
392. I have never seen ___ elephant. a) a b) an c) the d) any → b
393. Do you play ___ piano? a) a b) an c) the d) no article → c
394. We had ___ lunch at noon. a) a b) an c) the d) no article → d
395. The Nile is ___ longest river in Egypt. a) a b) the c) no article d) an → b
396. He plays ___ football every week. a) a b) the c) no article d) an → c
397. ___ people are kind. a) Most b) Most of c) The most d) Almost → a
398. Both of my brothers ___ doctors. a) is b) are c) am d) be → b
399. Neither of them ___ here. a) are b) is c) were d) have → b
400. Each student ___ a book. a) have b) has c) having d) are → b
401. Everybody ___ happy. a) are b) is c) were d) have → b
402. The news ___ good today. a) are b) is c) were d) be → b
403. 'Fewer' is used with ___. a) uncountable nouns b) countable nouns c) verbs d) adjectives → b
404. There is ___ traffic today. a) less b) fewer c) many d) few → a
405. I have ___ money left. a) few b) a few c) little d) many → c
406. She has ___ friends in this city, so she is lonely. a) a few b) few c) a little d) little → b
407. 'Borrow' means to ___. a) give something b) take something and return it c) buy something d) sell something → b
408. 'Lend' means to ___. a) take b) give temporarily c) buy d) keep → b
409. Can you ___ me your pen? a) borrow b) lend c) take d) bring → b
410. Can I ___ your pen? a) lend b) borrow c) bring d) give → b
411. Please ___ your book to class tomorrow. (to this place) a) bring b) take c) go d) put → a
412. Don't forget to ___ your umbrella when you go out. a) bring b) take c) come d) arrive → b
413. She ___ me about the party. a) said b) told c) spoke d) talked → b
414. He ___ that he was tired. a) told b) said c) spoke d) talked → b
415. We ___ about the problem for hours. a) said b) told c) talked d) tell → c
416. I'm ___ in learning Spanish. a) interested b) interesting c) interest d) interests → a
417. The lesson was ___. a) bored b) boring c) bore d) bores → b
418. I was ___ by the news. a) surprised b) surprising c) surprise d) surprises → a
419. The results were ___. a) disappointed b) disappointing c) disappoint d) disappoints → b
420. She is ___ of her son. a) proud b) pride c) prouds d) proudly → a
421. I'm fed up ___ this weather. a) of b) with c) at d) about → b
422. He apologized ___ being late. a) of b) to c) for d) with → c
423. She depends ___ her parents. a) of b) on c) in d) at → b
424. I agree ___ you. a) to b) with c) on d) at → b
425. He's married ___ a teacher. a) with b) to c) by d) for → b
426. Congratulations ___ your new job! a) for b) on c) at d) about → b
427. This is different ___ that one. a) than b) from c) of d) in → b
428. I'm worried ___ the exam. a) for b) about c) of d) at → b
429. She is famous ___ her paintings. a) for b) of c) at d) with → a
430. He is responsible ___ the project. a) of b) for c) to d) at → b
431. 'Give up' means ___. a) stop trying b) start c) continue d) wait → a
432. 'Look after' means ___. a) search b) take care of c) look at d) look like → b
433. 'Find out' means ___. a) discover information b) lose c) hide d) forget → a
434. 'Turn down' (an offer) means ___. a) accept b) refuse c) repeat d) forget → b
435. 'Put off' means ___. a) postpone b) wear c) cancel d) start → a
436. 'Run out of' means ___. a) have none left b) run fast c) escape d) win → a
437. 'Get along with' someone means ___. a) have a good relationship b) meet c) fight d) follow → a
438. 'Come across' means ___. a) find by chance b) cross c) arrive d) return → a
439. 'Carry on' means ___. a) continue b) carry c) stop d) cancel → a
440. 'Set up' a business means ___. a) close b) start c) sell d) buy → b
441. 'Take off' (a plane) means ___. a) land b) leave the ground c) crash d) stop → b
442. 'Work out' (a problem) means ___. a) solve b) ignore c) avoid d) create → a
443. 'Bring up' a child means ___. a) raise b) carry c) lift d) hit → a
444. 'Break down' (a car) means ___. a) stop working b) go fast c) start d) clean → a
445. 'Fill in' a form means ___. a) complete b) destroy c) read d) fold → a
446. 'A once-in-a-lifetime chance' means ___. a) very rare b) very common c) boring d) cheap → a
447. 'Piece of cake' means ___. a) something easy b) a dessert c) dangerous d) difficult → a
448. 'It's raining cats and dogs' means ___. a) raining heavily b) animals falling c) light rain d) windy → a
449. 'Break a leg!' means ___. a) Good luck! b) Be careful! c) Run! d) Sit down! → a
450. 'Under the weather' means ___. a) feeling ill b) outdoors c) happy d) cold → a
451. 'Once in a blue moon' means ___. a) very rarely b) every night c) often d) never → a
452. 'Hit the books' means ___. a) study hard b) fight c) read quickly d) throw books → a
453. 'Cost an arm and a leg' means ___. a) very expensive b) cheap c) painful d) free → a
454. 'Call it a day' means ___. a) stop working b) start working c) make a phone call d) cancel → a
455. 'Let the cat out of the bag' means ___. a) reveal a secret b) free a pet c) lose d) hide → a
456. The ___ of living is high in big cities. a) cost b) price c) pay d) fee → a
457. The doctor gave me a ___ for the medicine. a) prescription b) description c) subscription d) recipe → a
458. A 'salary' is money you get ___. a) from a job b) from a gift c) from the sea d) from a bank only → a
459. A ___ is a list of food in a restaurant. a) menu b) bill c) tip d) order → a
460. A short trip for pleasure is an ___. a) excursion b) migration c) invasion d) delay → a
461. If the plane is ___, it leaves later than planned. a) delayed b) arrived c) booked d) landed → a
462. You need a ___ to enter another country. a) passport b) receipt c) invoice d) menu → a
463. I'd like to ___ a table for four. a) reserve b) rescue c) remain d) refuse → a
464. A ___ is someone who lives next door. a) neighbour b) colleague c) stranger d) guest → a
465. A ___ is someone you work with. a) colleague b) neighbour c) tourist d) guest → a
466. 'Environment' is related to ___. a) nature b) money c) food d) clothes → a
467. 'Recycle' means to ___. a) use materials again b) throw away c) burn d) buy → a
468. Pollution is ___ for the environment. a) harmful b) helpful c) useful d) harmless → a
469. 'Global warming' means ___. a) the Earth is getting hotter b) cold weather c) world travel d) space flights → a
470. 'Reduce' means ___. a) make smaller b) make bigger c) repeat d) stop → a
471. He studied hard, ___ he failed the exam. a) because b) but c) so d) or → b
472. ___ it was cold, we went swimming. a) Because b) Although c) So d) Unless → b
473. I stayed at home ___ it was raining. a) because b) although c) but d) however → a
474. ___ the rain, we went out. a) Although b) Despite c) However d) Because → b
475. He didn't study. ___, he passed. a) Because b) However c) So d) Although → b
476. First, mix the eggs. ___, add the flour. a) Then b) Because c) However d) Although → a
477. I was tired. ___, I went to bed early. a) Therefore b) However c) Although d) But → a
478. ___ I like him, I don't trust him. a) Although b) Because c) So d) Unless → a
479. You can't enter ___ you have a ticket. a) unless b) if c) although d) because → a
480. She works hard ___ she can buy a house. a) so that b) although c) unless d) but → a
481. He ___ the piano for years. (and still does) a) played b) has played c) plays d) was playing → b
482. When I ___ the news, I cried. a) hear b) heard c) hearing d) have heard → b
483. By the time we arrived, the film ___. a) started b) has started c) had started d) starts → c
484. I ___ him since last week. a) didn't see b) haven't seen c) don't see d) hadn't seen → b
485. She ___ to Paris twice. a) went b) has been c) was d) goes → b
486. 'He has gone to Paris' means ___. a) he's there now b) he's back c) he never went d) he's coming → a
487. I ___ a letter when the lights went out. a) wrote b) was writing c) have written d) write → b
488. The train ___ at 6 tomorrow. (timetable) a) leaves b) leaving c) left d) leaved → a
489. I'll text you as soon as I ___. a) arrive b) will arrive c) arrived d) arriving → a
490. This time next week, I ___ on the beach. a) lie b) will be lying c) lay d) have lain → b
491. Which is correct? a) I am agree. b) I agree. c) I agrees. d) I'm agreeing to. → b
492. Which is correct? a) She suggested me to go. b) She suggested that I go. c) She suggested go. d) She suggest me go. → b
493. Which is correct? a) I look forward to hear from you. b) I look forward to hearing from you. c) I look forward hearing. d) I looking forward to hear. → b
494. Which is correct? a) He is the taller in the class. b) He is the tallest in the class. c) He is most tall. d) He is tallest of class. → b
495. Which is correct? a) I've been here since two hours. b) I've been here for two hours. c) I'm here since two hours. d) I was here for two hours now. → b
496. Which is correct? a) There isn't some milk. b) There isn't any milk. c) There isn't no milk. d) There aren't milk. → b
497. Which is correct? a) Despite of the rain, we went. b) Despite the rain, we went. c) In spite the rain, we went. d) Despite it rained, we went. → b
498. Which is correct? a) I enjoy to swim. b) I enjoy swimming. c) I enjoy swim. d) I enjoys swimming. → b
499. Which is correct? a) Where is the station, please? b) Where the station is? c) Where is station? d) Where station is, please? → a
500. Which is correct? a) Can you tell me where is the bank? b) Can you tell me where the bank is? c) Can you tell me where the bank does? d) Can you tell where bank is? → b
501. Which is correct? a) I don't know what is his name. b) I don't know what his name is. c) I don't know what name his is. d) I not know his name. → b
502. Which is correct? a) She's more older than me. b) She's older than me. c) She's oldest than me. d) She's more old than me. → b
503. Which is correct? a) My brother is a engineer. b) My brother is an engineer. c) My brother is engineer. d) My brother an engineer. → b
504. Which is correct? a) I've lost my keys yesterday. b) I lost my keys yesterday. c) I have lose my keys yesterday. d) I losed my keys yesterday. → b
505. Which is correct? a) He asked me what I was doing. b) He asked me what was I doing. c) He asked me what am I doing. d) He asked me what I am did. → a
506. Which is correct? a) The children is playing. b) The childrens are playing. c) The children are playing. d) The child are playing. → c
507. Which is correct? a) Many informations are useful. b) Much information is useful. c) Many information is useful. d) An information is useful. → b
508. Which is correct? a) She gave me an advice. b) She gave me some advice. c) She gave me advices. d) She gave me a advice. → b
509. Which is correct? a) I'm going to home. b) I'm going home. c) I'm going at home. d) I'm going in home. → b
510. Which is correct? a) He didn't went. b) He didn't go. c) He not went. d) He doesn't went. → b
511. If I had studied harder, I ___ the exam. a) would pass b) will pass c) would have passed d) had passed → c
512. If she ___ earlier, she wouldn't have missed the train. a) left b) had left c) has left d) would leave → b
513. I wouldn't be so tired if I ___ to bed earlier last night. a) went b) go c) had gone d) would go → c
514. If I were you, I ___ that offer. a) accept b) would accept c) will accept d) had accepted → b
515. Had I known about the delay, I ___ at home. a) stayed b) would stay c) would have stayed d) will stay → c
516. I'll lend you the car provided that you ___ it carefully. a) drive b) drove c) will drive d) would drive → a
517. ___ you need help, don't hesitate to call. a) Should b) Would c) Could d) Might → a
518. If only I ___ taller! a) am b) were c) will be d) have been → b
519. I wish I ___ the answer yesterday. a) knew b) know c) had known d) would know → c
520. She wishes he ___ so loudly. a) doesn't talk b) wouldn't talk c) didn't talked d) hasn't talk → b
521. It's high time we ___ home. a) go b) went c) will go d) have gone → b
522. I'd rather you ___ smoke in here. a) don't b) didn't c) won't d) not → b
523. Suppose you ___ lost your passport abroad, what would you do? a) have b) had c) will have d) would have → b
524. As long as you ___ the rules, you can stay. a) follow b) will follow c) followed d) would follow → a
525. The thief ___ by the police last night. a) arrested b) was arrested c) has arrested d) is arrested → b
526. The report ___ by Friday. a) must finish b) must be finished c) must finishing d) must have finish → b
527. The new law is said ___ next year. a) to introduce b) to be introduced c) introducing d) being introduced → b
528. He is believed ___ the country last year. a) to leave b) to have left c) leaving d) to be left → b
529. I had my car ___ yesterday. a) repair b) repaired c) repairing d) to repair → b
530. She is having her hair ___ tomorrow. a) cut b) cutting c) to cut d) cuts → a
531. Nobody likes ___ at in public. a) laughing b) being laughed c) to laugh d) laugh → b
532. The house ___ at the moment. a) is painting b) is being painted c) paints d) has painted → b
533. The documents ___ before the meeting started. a) had been signed b) were signing c) have signed d) signed → a
534. He denied ___ the window. a) to break b) breaking c) break d) broke → b
535. She admitted ___ the money. a) to steal b) stealing c) steal d) stole → b
536. I regret ___ you that the flight is cancelled. a) to tell b) telling c) tell d) told → a
537. I regret ___ so rudely to her yesterday. a) to speak b) speaking c) speak d) spoke → b
538. Remember ___ the door before you leave. a) locking b) to lock c) lock d) locked → b
539. I remember ___ him at the party last year. a) to meet b) meeting c) meet d) met → b
540. He stopped ___ because he was tired. a) to walk b) walking c) walk d) walked → b
541. On the way home, I stopped ___ some bread. a) buying b) to buy c) buy d) bought → b
542. She tried ___ the box but it was too heavy. a) lifting b) to lift c) lift d) lifted → b
543. If you can't sleep, try ___ a glass of warm milk. a) drinking b) to drink c) drink d) drank → a
544. I can't help ___ when I see that video. a) to laugh b) laughing c) laugh d) laughed → b
545. It's no use ___ over spilt milk. a) to cry b) crying c) cry d) cried → b
546. He's used to ___ up early. a) wake b) waking c) woke d) be waking → b
547. She insisted on ___ for the meal. a) pay b) paying c) to pay d) paid → b
548. They accused him ___ the documents. a) of stealing b) for stealing c) to steal d) with stealing → a
549. I look forward to ___ you next week. a) see b) seeing c) saw d) to see → b
550. She prevented him ___ the mistake. a) from making b) to make c) make d) of making → a
551. By next June, I ___ here for ten years. a) will work b) will have worked c) work d) have worked → b
552. This time tomorrow, we ___ over the Atlantic. a) fly b) will be flying c) flew d) have flown → b
553. She ___ for three hours when he finally arrived. a) waited b) has waited c) had been waiting d) was wait → c
554. I've been working here ___ 2019. a) for b) since c) from d) during → b
555. He ___ the piano since he was five. a) plays b) is playing c) has been playing d) played → c
556. The film ___ by the time we got to the cinema. a) already started b) had already started c) has already started d) was already start → b
557. He said he ___ the report the day before. a) finished b) had finished c) has finished d) would finish → b
558. She asked me ___ I had been to London. a) that b) whether c) what d) which → b
559. He told me not ___ late. a) be b) being c) to be d) to being → c
560. The teacher asked the students ___ quiet. a) be b) to be c) being d) that be → b
561. 'I'll call you tomorrow.' → She said she ___ me the next day. a) will call b) would call c) called d) calls → b
562. 'Where do you live?' → He asked me where I ___. a) live b) lived c) am living d) have lived → b
563. She said she ___ seen him since Monday. a) hasn't b) hadn't c) didn't d) wasn't → b
564. The woman ___ lives upstairs is a nurse. a) whose b) who c) whom d) which → b
565. The man ___ I spoke to was very helpful. a) whose b) what c) which d) whom → d
566. This is the house ___ I grew up. a) where b) which c) whose d) who → a
567. She has a son, ___ works in Dubai. a) that b) who c) whom d) which → b
568. The reason ___ he left was personal. a) why b) where c) whose d) who → a
569. Everything ___ he said was true. a) what b) that c) who d) whose → b
570. The book, ___ I bought last week, is excellent. a) that b) which c) who d) what → b
571. He passed the exam, ___ surprised everyone. a) that b) what c) which d) who → c
572. The children, most of ___ were tired, went to bed. a) who b) whom c) them d) which → b
573. She must ___ a lot of money to buy that house. a) has b) have c) having d) had → b
574. He can't ___ the answer. He wasn't there. a) know b) have known c) knows d) knowing → b
575. They might ___ already left. a) have b) has c) having d) to have → a
576. You ___ have told me! I'd have helped. a) should b) must c) can d) will → a
577. You ___ come with us if you don't want to. a) mustn't b) needn't c) can't d) shouldn't → b
578. You ___ park here. It's forbidden. a) needn't b) mustn't c) don't have to d) may not to → b
579. She ___ be at work. I saw her car outside. a) must b) can't c) shouldn't d) mustn't → a
580. It ___ rain tonight. (it's possible) a) can b) might c) must d) should to → b
581. I'd like to ___ a complaint about the service. a) do b) make c) have d) take → b
582. We need to ___ a decision soon. a) make b) do c) take part d) give → a
583. He decided to ___ a risk. a) make b) do c) take d) have → c
584. She always ___ attention to details. a) pays b) makes c) takes d) does → a
585. Can you ___ me a favour? a) make b) do c) give d) take → b
586. I ___ an effort to arrive on time. a) did b) made c) took d) paid → b
587. We should ___ advantage of this offer. a) take b) make c) do d) have → a
588. I can't ___ up with this noise any longer. a) put b) make c) take d) bring → a
589. The meeting has been ___ off because of the storm. a) called b) put c) taken d) made → a
590. We ran ___ of petrol on the motorway. a) out b) off c) away d) up → a
591. He takes ___ his father. (he looks like him) a) after b) up c) off d) over → a
592. I can't ___ out what this word means. a) work b) make c) take d) put → a
593. They've decided to ___ off the wedding until spring. a) put b) take c) run d) turn → a
594. The plane ___ off two hours late. a) took b) got c) went d) put → a
595. She ___ down the job offer because the salary was low. a) put b) turned c) took d) set → b
596. I'm ___ forward to the holidays. a) looking b) seeing c) waiting d) hoping → a
597. He ___ up smoking last year. a) gave b) put c) took d) turned → a
598. We need to ___ with the problem quickly. a) deal b) do c) take d) make → a
599. The company was ___ up in 1995. a) set b) put c) made d) taken → a
600. She came ___ an old photo while cleaning. a) across b) over c) through d) off → a
601. The ___ of the project depends on teamwork. a) succeed b) success c) successful d) successfully → b
602. He is a very ___ person; he never gives up. a) determined b) determine c) determination d) determiningly → a
603. The ___ between the two cars was minor. a) collide b) collision c) collided d) colliding → b
604. She spoke ___ about her experience. a) enthusiasm b) enthusiastic c) enthusiastically d) enthuse → c
605. It's ___ to drive without a licence. a) legal b) illegal c) unlegal d) nonlegal → b
606. His behaviour was completely ___. a) responsible b) irresponsible c) unresponsible d) disresponsible → b
607. The ___ of the new software was a challenge. a) implement b) implementation c) implemented d) implementing → b
608. The film was ___ than I expected. a) much better b) more better c) very better d) best → a
609. He is ___ clever than his brother. a) more b) much c) very d) most → a
610. The more you practise, ___ you become. a) the good b) the better c) better d) best → b
611. She's not as ___ as she looks. a) old b) older c) oldest d) more old → a
612. This is by far the ___ expensive restaurant in town. a) more b) most c) much d) very → b
613. He works ___ than anyone else I know. a) harder b) more hard c) hardest d) hard → a
614. The patient's condition is getting ___ and ___. a) worse and worse b) bad and bad c) worst and worst d) worse and bad → a
615. Neither Ali ___ his sister was at home. a) or b) nor c) and d) but → b
616. Either you ___ or I will. a) go b) goes c) going d) gone → a
617. Not only ___ late, but he also forgot his books. a) he was b) was he c) he is d) is he → b
618. Hardly ___ the house when it started to rain. a) I had left b) had I left c) I left d) did I left → b
619. Never before ___ such a beautiful sunset. a) I have seen b) have I seen c) I saw d) did I seen → b
620. No sooner had she arrived ___ the phone rang. a) when b) than c) that d) as → b
621. ___ the weather was bad, the match went ahead. a) Despite b) Although c) However d) In spite → b
622. ___ his injury, he finished the race. a) Although b) Despite c) However d) Even though → b
623. He worked hard; ___, he didn't get promoted. a) therefore b) nevertheless c) moreover d) so → b
624. The hotel was cheap. ___, it was clean and comfortable. a) Moreover b) However c) Otherwise d) Despite → a
625. Take an umbrella; ___, you'll get wet. a) otherwise b) moreover c) therefore d) although → a
626. We left early ___ avoid the traffic. a) in order to b) so as c) in order d) for to → a
627. She whispered ___ wake the baby. a) in order not to b) not to c) so as d) for not → a
628. ___ he was tired, he kept working. a) Even though b) Because c) So d) Unless → a
629. I'll go out ___ it stops raining. a) as soon as b) unless c) although d) in case → a
630. Take a sandwich ___ you get hungry. a) in case b) unless c) although d) if so → a
631. I can't concentrate ___ the noise. a) because b) due to c) so d) although → b
632. ___ the traffic, we were late. a) Because b) Owing to c) Although d) So → b
633. He's ___ rich that he can buy anything. a) such b) so c) too d) enough → b
634. It was ___ a difficult exam that many failed. a) so b) such c) too d) very → b
635. She's ___ tired to drive. a) too b) so c) enough d) such → a
636. He isn't ___ enough to join the army. a) old b) older c) oldest d) elder → a
637. There's hardly ___ milk left. a) some b) any c) many d) few → b
638. I have ___ time left, so I can't help you. a) little b) a little c) few d) a few → a
639. We have ___ time. Let's have a coffee. a) a little b) little c) few d) a few → a
640. A large number of students ___ absent today. a) is b) are c) was d) has been → b
641. The number of accidents ___ increased. a) have b) has c) are d) were → b
642. Neither of the answers ___ correct. a) are b) is c) were d) have → b
643. The police ___ looking for the suspect. a) is b) are c) was d) has → b
644. Mathematics ___ my favourite subject. a) are b) is c) were d) have → b
645. All of the information ___ useful. a) were b) was c) are d) have → b
646. She ___ the cleaning every Friday. a) makes b) does c) takes d) has → b
647. He is ___ the weather today. (he feels ill) a) under b) over c) below d) beneath → a
648. It's a ___ of time to argue about it. a) waste b) loss c) lack d) miss → a
649. They had a heated ___ about politics and shouted at each other. a) discussion b) argument c) talk d) speech → b
650. I couldn't make ___ what he was saying. a) up b) out c) off d) away → b
651. The ___ of the film was very moving. a) plot b) scene c) screen d) stage → a
652. The company made a huge ___ last year. a) profit b) benefit c) income d) wage → a
653. He was ___ for stealing a car. a) arrested b) captured c) caught d) held → a
654. The judge ___ him to five years in prison. a) sentenced b) judged c) fined d) accused → a
655. To ___ means to officially give up a job. a) resign b) retire c) fire d) hire → a
656. A person who works for a company and gets a salary is an ___. a) employer b) employee c) candidate d) customer → b
657. The ___ of living has risen sharply. a) cost b) price c) fee d) value → a
658. She was ___ to the university with a scholarship. a) accepted b) admitted c) allowed d) agreed → b
659. He has a very ___ attitude to work. a) positive b) possible c) powerful d) polite → a
660. The ___ of the earthquake was devastating. a) effect b) affect c) effort d) affair → a
661. Heavy rain could ___ the match. a) affect b) effect c) effort d) affair → a
662. Don't ___ the beginning of the film! a) lose b) miss c) lack d) fail → b
663. I'm afraid I don't ___ with you. a) agree b) accept c) allow d) admit → a
664. The company will ___ 50 new staff this year. a) recruit b) rescue c) remain d) repair → a
665. He's a ___ person; he never tells lies. a) honest b) humble c) hopeful d) harmful → a
666. She has a ___ for languages. a) talent b) tendency c) trend d) tradition → a
667. The doctor ___ him to rest for a week. a) advised b) suggested c) recommended d) proposed → a
668. We ___ the meeting until next week. a) postponed b) cancelled c) removed d) reduced → a
669. Columbus ___ America in 1492. a) invented b) discovered c) developed d) created → b
670. He ___ the cost of the repair. a) estimated b) expected c) expressed d) excluded → a
671. Oil and gas are the country's main ___. (goods it sells abroad) a) exports b) imports c) reports d) supports → a
672. His speech was very ___; everyone cried. a) touching b) touched c) touch d) touchy → a
673. It's not worth ___ the car. It's too old. a) repairing b) to repair c) repair d) repaired → a
674. She apologised ___ the delay. a) for b) of c) to d) at → a
675. He is capable ___ doing better. a) of b) for c) to d) at → a
676. I'm not familiar ___ this software. a) with b) to c) of d) in → a
677. She is responsible ___ the whole team. a) of b) for c) to d) at → b
678. The results are similar ___ last year's. a) to b) with c) as d) from → a
679. He insisted ___ paying for dinner. a) on b) in c) at d) to → a
680. I'm tired ___ listening to the same excuses. a) of b) from c) at d) with → a
681. If he hadn't ignored the warnings, he ___ in trouble now. a) wouldn't be b) won't be c) wouldn't have been d) hadn't been → a
682. Were it not for your help, I ___ in serious trouble now. a) would be b) would have been c) will be d) was → a
683. Had it not been for the storm, we ___ on time. a) would arrive b) would have arrived c) arrived d) will arrive → b
684. But for her support, I ___ up long ago. a) would give b) would have given c) gave d) will give → b
685. Should you ___ any questions, please contact us. a) have b) had c) having d) will have → a
686. If you were to ___ the offer, what would you do? a) refuse b) refused c) refusing d) refuses → a
687. Only after the results were published ___ the mistake. a) they noticed b) did they notice c) they did notice d) noticed they → b
688. Rarely ___ such dedication. a) we see b) do we see c) we do see d) see we → b
689. Under no circumstances ___ the door open. a) you should leave b) should you leave c) you leave d) leave you → b
690. Little ___ she know that the surprise was waiting. a) did b) does c) had d) was → a
691. So tired ___ that he fell asleep at the desk. a) he was b) was he c) did he d) he did → b
692. Not until I got home ___ I had lost my keys. a) I realised b) did I realise c) I did realise d) realised I → b
693. It was John ___ broke the window. a) which b) who c) whom d) whose → b
694. What I really need ___ a long holiday. a) are b) is c) were d) be → b
695. It's the quality, not the price, ___ matters. a) what b) that c) who d) whom → b
696. Having finished the report, ___. a) the phone rang b) she went home c) it was sent d) the boss left her → b
697. ___ the instructions carefully, you wouldn't have made that mistake. a) Read b) Had you read c) If you read d) Reading → b
698. Born in a small village, ___. a) the city was new to him b) he found the city overwhelming c) it was a shock d) life was hard → b
699. Not ___ what to say, she remained silent. a) know b) knowing c) known d) to know → b
700. The suspect, ___ by the police, denied everything. a) questioning b) questioned c) to question d) having question → b
701. He's said to ___ over a million pounds to charity last year. a) have donated b) donate c) donated d) be donate → a
702. The minister is reported ___ resigned. a) have b) to have c) having d) to be → b
703. It is essential that he ___ present. a) is b) be c) was d) will be → b
704. The doctor recommended that she ___ more rest. a) gets b) get c) got d) will get → b
705. I'd sooner you ___ it to anyone. a) don't mention b) didn't mention c) won't mention d) not mention → b
706. She insisted that the meeting ___ postponed. a) is b) be c) was being d) would → b
707. He must have been working all night, ___? a) mustn't he b) hasn't he c) wasn't he d) didn't he → b
708. I wish I ___ so much last night. a) didn't eat b) wouldn't eat c) hadn't eaten d) haven't eaten → c
709. If only she ___ listened to my advice! a) has b) would c) did d) had → d
710. She talks as if she ___ a millionaire, but she's actually broke. a) is b) were c) will be d) has been → b
711. By the time you read this, I ___ gone. a) would have b) have c) will have d) had → c
712. By 2030, scientists ___ a cure. a) found b) have found c) would find d) will have found → d
713. She ___ for the company for 20 years by next month. a) works b) will have worked c) will work d) has worked → b
714. At 10 p.m. tomorrow, I ___ on a plane. a) sat b) have sat c) will be sitting d) will sit → c
715. By the time he arrives, I ___ the report. a) finish b) finished c) have finished d) will have finished → d
716. He was about ___ when the phone rang. a) leaving b) to leave c) leave d) left → b
717. The meeting is ___ to start at nine. a) owing b) bound c) due d) supposing → c
718. She is ___ to be the new director. a) probably b) maybe c) possible d) likely → d
719. They're bound ___ the match. a) win b) winning c) to win d) won → c
720. He's the last person ___ lie. a) who b) to c) for d) that to → b
721. It's ___ that she'll accept the job. (very unlikely) a) doubt b) doubtful c) doubtfully d) doubtless → b
722. The company is ___ of bankruptcy. a) in the verge b) at the verge c) on the verge d) under the verge → c
723. He did it ___ my advice. a) opposite b) against c) contrary d) versus → b
724. ___ to popular belief, the Great Wall isn't visible from space. a) Against b) Opposite c) Contrary d) Despite → c
725. The new policy came into ___ last month. a) action b) effect c) use d) affect → b
726. The athlete was pushed ___ the limit. a) at b) in c) by d) to → d
727. He's good at ___ the ice at parties. a) cracking b) melting c) breaking d) cutting → c
728. Don't judge a book ___ its cover. a) from b) by c) with d) on → b
729. The two companies have decided to join ___. a) powers b) strengths c) forces d) armies → c
730. He's under a lot of ___ at work. a) press b) pressing c) presses d) pressure → d
731. We need to ___ a compromise. a) arrive b) reach c) win d) take → b
732. The police are ___ the cause of the fire. a) inquiring b) searching c) exploring d) investigating → d
733. He ___ his success to hard work. a) owes b) debts c) lends d) borrows → a
734. She was ___ with guilt. a) overtaken b) overcome c) overlooked d) overtook → b
735. The court ___ a heavy fine on the company. a) exposed b) opposed c) imposed d) deposed → c
736. The suspect was ___ of all charges. a) acquired b) released c) ignored d) cleared → d
737. His comments ___ a lot of controversy. a) cooked b) sparked c) drove d) pulled → b
738. They've been ___ for years over the land. a) at ease b) at large c) at odds d) at hand → c
739. A ___ of evidence suggests the theory is correct. a) weal b) wealthy c) wealthily d) wealth → d
740. The scandal ___ his reputation. a) tempted b) tarnished c) twisted d) tolerated → b
741. The manager ___ the proposal as unrealistic. a) dispersed b) displayed c) dismissed d) dissolved → c
742. She has a keen ___ for detail. a) arm b) foot c) lip d) eye → d
743. He was acting ___ strangely, so we became suspicious. a) increased b) increasingly c) increase d) increasing → b
744. The new rules will ___ affect small businesses. a) adverse b) adversary c) adversely d) adversity → c
745. It was an ___ decision made in a hurry. a) well-considered b) un-considerate c) re-considered d) ill-considered → d
746. There was a ___ silence after his announcement. a) deafened b) deafening c) deafen d) deafness → b
747. The film received ___ reviews from critics. a) mixing b) mix c) mixed d) mixes → c
748. Their relationship has ___ over the years. a) deteriorate b) deterioration c) deteriorating d) deteriorated → d
749. The ___ of the new law surprised everyone. a) enforce b) enforcement c) enforced d) enforcing → b
750. His ___ remarks offended many people. a) derogate b) derogation c) derogatory d) derogated → c
751. She's very ___; she can solve any problem. a) resource b) resourcing c) resourced d) resourceful → d
752. The company is facing ___ financial difficulties. a) considerate b) considerable c) considering d) considerably → b
753. The manager was very ___ when I made a mistake. a) understandable b) understood c) understand d) understanding → d
754. The discovery had far-___ consequences. a) reached b) reaching c) reach d) reaches → b
755. What a ___ coincidence! a) remark b) remarking c) remarkable d) remarkably → c
756. She ___ the offer politely but firmly. a) declared b) deceived c) decayed d) declined → d
757. A ___ of tourists visited the museum. a) thread b) throng c) throne d) thrust → b
758. The negotiators reached a ___ after weeks of talks. a) deadline b) deadlock c) deadweight d) deadpan → b
759. The weather forecast is ___ unreliable. a) notorious b) notoriety c) notoriously d) notoriousness → c
760. Prices have ___ dramatically this year. a) sored b) soared c) soured d) sorted → b
761. The project was ___ by lack of funding. a) harvested b) hunted c) hampered d) harbored → c
762. He tried to ___ the blame onto his colleague. a) shine b) shift c) shave d) shell → b
763. They had to ___ the plan due to lack of funds. a) scrape b) scrub c) scrap d) scratch → c
764. The company has ___ a loss for the third year in a row. a) pasted b) posted c) pouted d) pointed → b
765. She has a ___ sense of humour. a) dried b) drying c) dry d) drain → c
766. I'm completely ___ about this issue; I can't decide. a) in two heads b) at two minds c) on two minds d) in two minds → d
767. He's always ___ his own trumpet. a) beating b) blowing c) playing d) shouting → b
768. We're all in the same ___. a) ship b) car c) boat d) bus → c
769. Losing that job was a ___; it led to a better one. a) blessing in mask b) blessing in secret c) blessing with hide d) blessing in disguise → d
770. She was over the ___ when she won the lottery. a) sun b) sky c) stars d) moon → d
771. He's feeling a bit under the ___. a) rain b) weather c) cloud d) storm → b
772. He decided to ___ the bullet and ask for a pay rise. a) chew b) swallow c) bite d) eat → c
773. It's only the ___ of the iceberg; the problem is much bigger. a) tip b) top c) point d) peak → a
774. It's a far ___ from what we expected. a) shout b) cry c) call d) yell → b
775. He spilled the ___ about the surprise party. a) peas b) rice c) beans d) corn → c
776. Don't put all your ___ in one basket. a) apples b) eggs c) coins d) cards → b
777. She's got cold ___ about the interview. a) hands b) toes c) knees d) feet → d
778. They decided to bury the ___ and become friends again. a) axe b) hatchet c) knife d) sword → b
779. The film was a real ___; I couldn't stop crying. a) tearmaker b) cryjerker c) tearjerker d) tearpuller → c
780. It's not rocket ___. a) physics b) science c) engineering d) maths → b
781. The deal fell ___ at the last minute. a) over b) off c) away d) through → d
782. He had to ___ up to his mistakes. a) pull b) put c) take d) face → d
783. She decided to ___ the offer and think it over. a) sleep in b) sleep on c) sleep over d) sleep through → b
784. His car broke ___ on the motorway. a) off b) away c) down d) out → c
785. I can't ___ with his rude behaviour any longer. a) put on b) put off c) put out d) put up → d
786. The company ___ off 200 workers last year. a) lay b) laid c) lain d) layed → b
787. It is widely ___ that the minister will resign. a) told b) spoken c) said d) talked → c
788. She worked her way ___ from cleaner to director. a) over b) off c) along d) up → d
789. It dawned ___ me that I had left my wallet at home. a) at b) in c) on d) to → c
790. He is not ___ of making such a mistake. a) able b) capable c) possible d) likely → b
791. The two proposals are not ___ exclusive. a) mutual b) mutuality c) mutually d) mutuals → c
792. She is ___ to her job; she works day and night. a) devoting b) devote c) devotion d) devoted → d
793. Everyone was ___ to hear the news. a) astonishing b) astonished c) astonish d) astonishment → b
794. The ___ of his argument was undeniable. a) logical b) logically c) logician d) logic → d
795. The suspect ___ to the crime. a) confessing b) confession c) confessed d) confessor → c
796. They have been ___ in a bitter dispute. a) embroider b) embroidered c) embroidery d) embroiled → d
797. The firm is ___ a major restructuring. a) underlining b) understanding c) undermining d) undergoing → d
798. He ___ the importance of regular exercise. a) strained b) stressed c) stretched d) strode → b
799. The decision was ___ criticised by the press. a) wide b) width c) widely d) widen → c
800. Your comments were completely off-topic and ___ to the issue. a) irrelevantly b) irrelevant c) irrelevance d) relevancy → b
801. She's reluctant ___ her opinion in public. a) sharing b) to share c) share d) shared → b
802. The CEO is notorious ___ his temper. a) of b) with c) for d) about → c
803. He's prone ___ making careless mistakes. a) for b) at c) of d) to → d
804. The report is open ___ interpretation. a) for b) to c) at d) with → b
805. She was oblivious ___ the danger. a) of b) for c) to d) at → c
806. He is infamous ___ his arrogance. a) of b) for c) as d) with → b
807. The company is accountable ___ its shareholders. a) of b) for c) to d) at → c
808. They are committed ___ reducing emissions. a) for b) at c) with d) to → d
809. This problem is beyond ___. a) we b) us c) our d) ours → b
810. She prides herself ___ her punctuality. a) at b) for c) on d) in → c
811. He took no notice ___ my warning. a) to b) of c) at d) for → b
812. In ___ of the evidence, the charges were dropped. a) lights b) lighting c) lit d) light → d
813. The match was cancelled on ___ of the weather. a) behalf b) account c) basis d) base → b
814. ___ the circumstances, he handled it well. a) Giving b) Gave c) Given d) Give → c
815. ___ speaking, the plan is sound. a) Broad b) Breadth c) Broadly d) Broaden → c
816. She's, ___ all, a very talented singer. a) over b) beyond c) across d) above → d
817. By ___ means is he guilty. a) any b) no c) some d) every → b
818. He didn't pass; ___, he didn't even try. a) in case b) in fact c) in order d) in spite → b
819. The project is, ___, finished; only small details remain. a) at all costs b) by all means c) to all intents and purposes d) on the whole → c
820. She decided to go ahead ___ the risks. a) because of b) in spite of c) thanks to d) owing to → b
821. He's an expert ___ the field of genetics. a) at b) in c) on d) of → b
822. The ___ of the problem lies in poor communication. a) route b) rout c) root d) rote → c
823. The two sides remain ___ apart on key issues. a) pole b) polar c) poled d) poles → d
824. The cost of the project has ___ out of control. a) stamped b) spiralled c) strolled d) stirred → b
825. The politician's speech was full of empty ___. a) rhythm b) rhetoric c) rhyme d) riddle → b
826. The new law is likely to ___ a heated debate. a) protect b) prohibit c) provoke d) provide → c
827. The novel is a ___ of the author's own life. a) reflex b) reflect c) reflecting d) reflection → d
828. We need to ___ the data carefully before drawing conclusions. a) scrutiny b) scrutinise c) scrutinising d) scrutinised → b
829. His story doesn't ___ up; there are too many gaps. a) put b) take c) set d) add → d
830. There's a growing ___ that the plan will fail. a) fearing b) fear c) feared d) fearful → b
831. She has a ___ for getting into trouble. a) knock b) knit c) knack d) knot → c
832. He ___ at the chance to work abroad. a) jammed b) jogged c) joked d) jumped → d
833. The CEO ___ down after the scandal. a) stopped b) stuck c) stepped d) strayed → c
834. The police have ___ up a special team to investigate. a) put b) set c) laid d) made → b
835. I'll ___ you in on the details later. a) fell b) fill c) feel d) fall → b
836. Don't ___ to conclusions without evidence. a) step b) climb c) swim d) jump → d
837. We should ___ our differences aside and work together. a) hang b) bring c) draw d) set → d
838. He's ___ in his ways; he never changes. a) put b) laid c) cast d) set → d
839. The chairman called the meeting ___ order. a) for b) at c) in d) to → d
840. At the end of the ___, it's your decision. a) night b) week c) hour d) day → d
841. Scarcely had the speaker finished ___ the audience erupted in applause. a) than b) when c) that d) as → b
842. ___ I known the risks, I would never have invested. a) Have b) Were c) Should d) Had → d
843. Such ___ the force of the blast that windows shattered a mile away. a) is b) has c) was d) were → c
844. Be that ___ it may, we must proceed. a) as b) what c) so d) how → a
845. Come what ___, I will stand by you. a) will b) may c) shall d) can → b
846. Suffice it ___ that the plan failed. a) say b) saying c) to say d) said → c
847. Lest he ___ the secret, they spoke in whispers. a) reveals b) revealed c) would reveal d) reveal → d
848. The committee demanded that the report ___ withdrawn. a) was b) is c) be d) were → c
849. Were he ___ to apologise, I might reconsider. a) to b) will c) would d) going → a
850. Not a single word ___ she say during the meeting. a) had b) did c) does d) was → b
851. Hardly any of last year's candidates ___ the required standard. a) was reaching b) reach c) has reached d) reached → d
852. It is imperative that every employee ___ the new regulations. a) understands b) understand c) understood d) understanding → b
853. He spoke so softly as to be barely ___. a) audience b) auditory c) audible d) audition → c
854. The two theories are, in many respects, ___. a) irreconcilably b) irreconcile c) irreconciling d) irreconcilable → d
855. Her argument, though ___, failed to convince the jury. a) eloquence b) eloquent c) eloquently d) eloquency → b
856. She has a ___ memory; she can recite whole books. a) prodigy b) prodigal c) prodigious d) prodigally → c
857. The politician's promises turned out to be ___. a) illusion b) illusionist c) illuminate d) illusory → d
858. The report was ___ in its criticism of the government. a) scathe b) scathed c) scathingly d) scathing → d
859. The company's ___ rise to fame surprised analysts. a) meteor b) meteoric c) meteorite d) meteorology → b
860. A ___ of discontent spread through the ranks. a) groundwork b) grounding c) groundswell d) groundhog → c
861. His ___ remarks about the project dampened everyone's spirits. a) disparate b) desperate c) disparity d) disparaging → d
862. The orchestra gave a ___ performance of the symphony. a) flawless b) flaw c) flawed d) flawlessly → a
863. The minister's resignation was ___ inevitable. a) virtual b) virtually c) virtue d) virtuous → b
864. The villagers lived in ___ poverty. a) object b) subject c) abject d) reject → c
865. A ___ amount of research supports this claim. a) substance b) substantiate c) substantially d) substantial → d
866. He was ___ to the idea of moving abroad. a) adverse b) averse c) diverse d) reverse → b
867. The two events are ___ related. a) inexplicably b) inexcusably c) inextricably d) inevitably → c
868. They were ___ by the sheer scale of the task. a) haunted b) taunted c) flaunted d) daunted → d
869. The rebels were ___ by superior forces. a) varnished b) vanquished c) vanished d) vindicated → b
870. The judge's ruling set an important ___. a) president b) precedence c) precedent d) precedents → c
871. The scientist's theory was ___ by new evidence. a) corrugated b) corroborated c) corrupted d) correlated → b
872. He made a ___ attempt to hide his embarrassment. a) fertile b) fragile c) fertilise d) futile → d
873. The team gave a ___ performance and lost heavily. a) lacklustre b) lacquered c) lackey d) lacked → a
874. His ___ attitude towards safety led to the accident. a) cavity b) cavalier c) cavern d) cavalcade → b
875. The negotiations reached a ___ and talks were suspended. a) stale b) stalemated c) stalemating d) stalemate → d
876. She was ___ of any wrongdoing. a) exhorted b) exonerated c) exhumed d) exacerbated → b
877. The tax cut will ___ the economy. a) simulate b) stipulate c) stimulate d) stigmatise → c
878. His ___ behaviour at the party embarrassed everyone. a) boring b) boarding c) boorishly d) boorish → d
879. The company's ___ growth impressed investors. a) exponential b) exponent c) exponentially d) exponents → a
880. Her ___ nature made her popular. a) affluent b) affable c) affected d) effable → b
881. It would be ___ to ignore the warnings. a) prudent b) imprudence c) imprudently d) imprudent → d
882. The author's style is ___ and difficult to follow. a) convolution b) convolute c) convoluted d) convoluting → c
883. He was ___ in his refusal to compromise. a) adamantly b) adamance c) adamants d) adamant → d
884. The new regulations are ___ with EU law. a) consistency b) consistent c) consistently d) consist → b
885. The film was a ___ success. a) resound b) resonant c) resounded d) resounding → d
886. Her speech was peppered ___ anecdotes. a) by b) with c) of d) in → b
887. The scientist was ___ in his research. a) meticulously b) meticulosity c) meticulous d) meticules → c
888. The defendant was acquitted ___ all charges. a) from b) of c) on d) for → b
889. It was a ___ victory; the winners had paid a heavy price. a) Pyrrhic b) Spartan c) Trojan d) Herculean → a
890. His task was ___; it required immense effort. a) Pyrrhic b) Spartan c) Trojan d) Herculean → d
891. Opening that file was like opening ___ box; it unleashed endless problems. a) Hobson's b) Occam's c) Morton's d) Pandora's → d
892. Using a sledgehammer to crack a nut is a case of ___. a) overdue b) overkill c) overlook d) overhaul → b
893. His arguments were ___ with logical flaws. a) ridden b) rid c) riddled d) riding → c
894. The mayor's statement was a ___ attempt to deflect criticism. a) thinly veiled b) thickly veiled c) thin veil d) veiled thin → a
895. The film's plot is ___, full of twists. a) labyrinth b) labyrinthine c) labyrinthic d) labyrinths → b
896. He was ___ at the news and burst into tears. a) distract b) distracted c) distraction d) distraught → d
897. His ___ wit made him feared at dinner parties. a) cautious b) caustic c) cautionary d) caution → b
898. The treaty was signed in an attempt to ___ tensions. a) diffuse b) confuse c) infuse d) defuse → d
899. The light was ___ through the thick fog. a) diffused b) defused c) confused d) refused → a
900. The old man's ___ words stayed with her forever. a) parted b) part c) partial d) parting → d
901. Which sentence is correct? a) Neither of the proposals have been accepted. b) Neither of the proposals has been accepted. c) Neither of the proposals are accepted. d) Neither of proposals has been accepted. → b
902. Which sentence is correct? a) Between you and I, it's a mistake. b) Between you and myself, it's a mistake. c) Between I and you, it's a mistake. d) Between you and me, it's a mistake. → d
903. Which sentence is correct? a) I would have preferred that he not come. b) I would have preferred that he doesn't come. c) I would have preferred he not to came. d) I would have preferred him not came. → a
904. Which sentence avoids a dangling modifier? a) Walking down the street, a car hit him. b) Walking down the street, the car hit him. c) Having walked down the street, a car hit him. d) Walking down the street, he was hit by a car. → d
905. Which sentence is correct? a) The reason is because he was late. b) The reason is that he was late. c) The reason why is because he was late. d) The reason being because he was late. → b
906. Which sentence uses 'whom' correctly? a) Whom is at the door? b) Whom wants coffee? c) The man whom I met is a lawyer. d) I know whom did it. → c
907. Which sentence is correct? a) She is one of those people who is always late. b) She is one of those people who always is late. c) She is one of the people who is late. d) She is one of those people who are always late. → d
908. Which sentence is correct? a) Each of the students have their own laptop. b) Each of the students are having a laptop. c) Each of the students has a laptop. d) Each students has a laptop. → c
909. Which sentence is punctuated correctly? a) Its a fine day, isn't it? b) Its' a fine day, isn't it? c) It's a fine day, isn't it? d) It's a fine day isnt it? → c
910. Which sentence is correct? a) The committee have made it's decision. b) The committee has made it's decision. c) The committee are made its decision. d) The committee has made its decision. → d
911. 'Ubiquitous' most nearly means: a) rare b) present everywhere c) dangerous d) ancient → b
912. 'Perfunctory' most nearly means: a) thorough b) cheerful c) hostile d) done with minimal effort → d
913. 'Obsequious' most nearly means: a) rebellious b) clever c) excessively eager to please d) indifferent → c
914. 'Ineffable' most nearly means: a) too great to be expressed in words b) harmless c) unbelievable d) unimportant → a
915. 'Quixotic' most nearly means: a) realistic b) cowardly c) wealthy d) unrealistically idealistic → d
916. 'Pernicious' most nearly means: a) helpful b) obvious c) temporary d) harmful in a gradual way → d
917. 'Equivocal' most nearly means: a) clear b) honest c) open to more than one interpretation d) equal → c
918. 'Magnanimous' most nearly means: a) mean b) generous and forgiving c) shy d) angry → b
919. 'Recalcitrant' most nearly means: a) obedient b) forgetful c) calm d) stubbornly resisting authority → d
920. 'Sycophant' most nearly means: a) a critic b) a leader c) a teacher d) a flatterer who seeks favour → d
921. 'Laconic' most nearly means: a) talkative b) sleepy c) using few words d) rude → c
922. 'Mellifluous' (of a voice) means: a) harsh b) loud c) weak d) sweet and smooth → d
923. 'Intransigent' most nearly means: a) flexible b) tired c) refusing to change one's views d) hopeful → c
924. 'Pugnacious' most nearly means: a) peaceful b) eager to fight or argue c) fearful d) generous → b
925. 'Capricious' most nearly means: a) steady b) calm c) careful d) unpredictable → d
926. 'Ostentatious' most nearly means: a) modest b) hidden c) showy d) broken → c
927. 'Fastidious' most nearly means: a) careless b) hungry c) fast d) very attentive to detail → d
928. 'Insidious' most nearly means: a) cheerful b) loud c) gradual and harmful, working in a hidden way d) honest → c
929. 'Loquacious' most nearly means: a) silent b) angry c) wise d) very talkative → d
930. 'Munificent' most nearly means: a) stingy b) very generous c) powerful d) tiny → b
931. 'Truculent' most nearly means: a) friendly b) truthful c) tired d) defiantly aggressive → d
932. 'Vicarious' (a vicarious thrill) means: a) dangerous b) personal c) brief d) experienced through another person → d
933. 'Sanguine' means: a) gloomy b) optimistic c) furious d) sleepy → b
934. 'Venerable' most nearly means: a) poisonous b) fashionable c) respected because of age or wisdom d) greedy → c
935. 'Abstruse' most nearly means: a) simple b) rude c) absent d) hard to understand → d
936. 'Perspicacious' most nearly means: a) confused b) lazy c) having keen insight d) sweaty → c
937. 'Lugubrious' most nearly means: a) joyful b) greedy c) lucky d) mournful → d
938. 'Obstreperous' most nearly means: a) quiet b) obvious c) noisy and difficult to control d) elderly → c
939. 'Pellucid' most nearly means: a) cloudy b) heavy c) bitter d) transparently clear → d
940. 'Propitious' most nearly means: a) proper b) favourable c) proud d) poor → b
941. 'Specious' most nearly means: a) special b) spacious c) misleadingly plausible d) precise → c
942. 'Tenuous' most nearly means: a) strong b) tense c) tough d) very weak or slight → d
943. 'Vacillate' means: a) to vacuum b) to vanish c) to vaccinate d) to waver between choices → d
944. 'Eschew' means: a) to chew b) to deliberately avoid c) to eat d) to ask → b
945. 'Exacerbate' means: a) to exaggerate b) to examine c) to make worse d) to excuse → c
946. 'Mitigate' means: a) to migrate b) to multiply c) to measure d) to make less severe → d
947. 'Ameliorate' means: a) to delay b) to make better c) to cancel d) to ask → b
948. 'Placate' means: a) to place b) to plant c) to calm someone's anger d) to pause → c
949. 'Disseminate' means: a) to dissect b) to spread widely c) to disagree d) to dismiss → b
950. 'Ostracise' means: a) to praise b) to bury c) to copy d) to exclude from a group → d
951. The company's decision to downsize was a bitter ___ to swallow. a) tablet b) capsule c) pill d) dose → c
952. He's been ___ the midnight oil to finish the thesis. a) lighting b) burning c) using d) fuelling → b
953. She ___ the wind out of his sails with one comment. a) blew b) let c) put d) took → d
954. The new policy opened a can of ___. a) snakes b) beans c) worms d) bugs → c
955. After years of struggle, she finally ___ her stride. a) beat b) took c) set d) hit → d
956. The deal is ___ in the balance. a) holding b) hanging c) staying d) standing → b
957. We'll cross that bridge ___ we come to it. a) if b) when c) until d) unless → b
958. She's the ___ of the family; everyone looks up to her. a) monarch b) patriarch c) matriarch d) marshal → c
959. The discovery is a real game ___. a) player b) maker c) winner d) changer → d
960. It's time to ___ the elephant in the room. a) address b) adore c) adjust d) adopt → a
961. Their plan ___ the test of time. a) sat b) stood c) ran d) held → b
962. The proposal was ___ in the bud. a) cut b) pinched c) nipped d) pruned → c
963. He's walking on ___ ice after that remark. a) slim b) light c) narrow d) thin → d
964. The ruling opened the ___ for more lawsuits. a) flood doors b) floodgates c) floods d) watergates → b
965. She was caught between a rock and a ___ place. a) heavy b) tough c) hard d) solid → c
966. The CEO is the brains ___ the operation. a) beyond b) behind c) beneath d) beside → b
967. He is ___ his depth in this discussion. a) beyond b) off c) away from d) out of → d
968. Don't throw the baby out with the ___. a) bathtub b) bath c) water d) bathwater → d
969. We're barking up the wrong ___. a) hill b) tree c) road d) wood → b
970. It's a ___ of the times that everyone is online. a) mark b) signal c) sign d) symbol → c
971. 'Equanimity' means: a) equality b) anger c) calmness in difficulty d) a type of music → c
972. 'Ennui' means: a) enjoyment b) boredom and dissatisfaction c) energy d) envy → b
973. 'Schadenfreude' means: a) fear of heights b) love of nature c) great sorrow d) pleasure at another's misfortune → d
974. 'Zeitgeist' means: a) a ghost b) timekeeping c) a surprise d) the spirit of an era → d
975. 'Carte blanche' means: a) a menu b) complete freedom to act c) a white card d) a signature → b
976. 'Faux pas' means: a) a fake passport b) a walking stick c) a social blunder d) a dance → c
977. 'De facto' means: a) by law b) in doubt c) of the future d) in fact, whether or not officially recognised → d
978. 'Bona fide' means: a) false b) friendly c) genuine d) fashionable → c
979. 'Ad hoc' means: a) permanent b) created for a specific purpose c) very old d) illegal → b
980. 'Quid pro quo' means: a) a question b) a riddle c) a quiet place d) something given in return for something → d
981. 'Status quo' means: a) a high rank b) the existing state of affairs c) a quota d) a quarrel → b
982. 'Per se' means: a) per second b) for peace c) by or in itself d) in secret → c
983. 'Prima facie' means: a) a first face b) most important c) in the end d) at first sight → d
984. 'In lieu of' means: a) in addition to b) because of c) instead of d) in spite of → c
985. 'Vis-à-vis' means: a) far away from b) in relation to c) instead of d) in spite of → b
986. Which word is the most formal? a) buy b) get c) purchase d) grab → c
987. Which phrase is the most formal? a) look into b) check out c) dig around d) investigate → d
988. Which is the most formal way to end a letter beginning 'Dear Sir or Madam'? a) Cheers b) Bye for now c) See you d) Yours faithfully → d
989. The evidence is ___, so we cannot draw firm conclusions. a) conclusive b) inconclusive c) conclusion d) concluding → b
990. The speaker ___ that costs would rise, without saying it directly. a) inferred b) implicated c) implied d) applied → c
991. From her silence, I ___ that she disagreed. a) implied b) replied c) implicated d) inferred → d
992. 'Disinterested' means: a) impartial b) bored c) uninterested d) unaware → a
993. 'Uninterested' means: a) impartial b) very curious c) biased d) not interested → d
994. The noise was ___ — it never stopped for an hour. a) continual b) continuing c) continuous d) continuity → c
995. An ___ storm forced us to cancel the trip. a) eminent b) imminent c) immanent d) emanant → b
996. He's a man of high ___. a) principal b) principle c) principals d) principally → b
997. The question was meant to ___ a reaction. a) illicit b) solicit c) explicit d) elicit → d
998. The car remained ___ at the lights. a) stationery b) stationer c) stationary d) stationing → c
999. There were ___ complaints this year than last year. a) less b) fewer c) little d) lesser → b
1000. To ___ it may concern, I am writing to complain. a) who b) whom c) whose d) which → b
`;

function getLevelByQuestionNumber(num: number): CefrLevel {
  if (num <= 170) return 'A1';
  if (num <= 340) return 'A2';
  if (num <= 510) return 'B1';
  if (num <= 680) return 'B2';
  if (num <= 840) return 'C1';
  return 'C2';
}

function inferSkill(text: string): 'grammar' | 'vocabulary' {
  const lower = text.toLowerCase();
  if (
    lower.includes('means') ||
    lower.includes('opposite of') ||
    lower.includes('which word is a ') ||
    lower.includes('which is a ') ||
    lower.includes('a place where') ||
    lower.includes('a room where') ||
    lower.includes('a person who') ||
    lower.includes('asks about') ||
    lower.includes('you say this') ||
    lower.includes('most formal')
  ) {
    return 'vocabulary';
  }
  return 'grammar';
}

function parseRawQuestions(raw: string): QuestionBankItem[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsed: QuestionBankItem[] = [];
  const lineRegex = /^(\d+)\.\s+(.+?)\s+a\)\s+(.+?)\s+b\)\s+(.+?)\s+c\)\s+(.+?)\s+d\)\s+(.+?)\s*→\s*([abcd])$/;

  for (const line of lines) {
    const match = line.match(lineRegex);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    const text = match[2].trim();
    const optA = match[3].trim();
    const optB = match[4].trim();
    const optC = match[5].trim();
    const optD = match[6].trim();
    const correctAnswer = match[7].trim();
    const targetLevel = getLevelByQuestionNumber(num);

    parsed.push({
      id: `q_${num}`,
      number: num,
      text,
      type: 'multiple-choice',
      skill: inferSkill(text),
      targetLevel,
      correctAnswer,
      options: [
        { id: 'a', text: optA },
        { id: 'b', text: optB },
        { id: 'c', text: optC },
        { id: 'd', text: optD },
      ],
    });
  }

  return parsed;
}

export const MCQ_1000_BANK: QuestionBankItem[] = parseRawQuestions(RAW_1000_QUESTIONS);

export const WRITING_QUESTION_BANK: QuestionBankItem[] = [
  { id: 'a1_w1', text: 'Write 2 sentences about your family. (Example: "I have a mother and a father.")', type: 'open-text', skill: 'writing', targetLevel: 'A1' },
  { id: 'a2_w1', text: 'Write 3 sentences about what you did last weekend.', type: 'open-text', skill: 'writing', targetLevel: 'A2' },
  { id: 'b1_w1', text: 'Write a short paragraph (3-5 sentences) describing your ideal job and why you would enjoy it.', type: 'open-text', skill: 'writing', targetLevel: 'B1' },
  { id: 'b2_w1', text: 'Explain in a short paragraph (4-5 sentences) the advantages and disadvantages of social media on society.', type: 'open-text', skill: 'writing', targetLevel: 'B2' },
  { id: 'c1_w1', text: 'Explain in 2-3 sentences the difference between "affect" and "effect", providing one example for each.', type: 'open-text', skill: 'writing', targetLevel: 'C1' },
  { id: 'c2_w1', text: 'Write a nuanced analysis (4-5 sentences) of whether artificial intelligence poses an existential risk to humanity, using advanced academic vocabulary and complex sentence structures.', type: 'open-text', skill: 'writing', targetLevel: 'C2' },
];

export const SPEAKING_QUESTION_BANK: QuestionBankItem[] = [
  // ── Beginner (A1 / A2) ──────────────────────────────────────────────────────
  { id: 'sp_a1_1', text: 'Please introduce yourself. Talk about your name, age, hometown, and what you do for work or study.', type: 'speaking', skill: 'speaking', targetLevel: 'A1' },
  { id: 'sp_a2_1', text: 'Describe a typical daily routine of yours. What do you usually do in the morning and evening?', type: 'speaking', skill: 'speaking', targetLevel: 'A2' },
  { id: 'sp_a2_2', text: 'Talk about your favorite hobby or sport. Why do you enjoy it, and how often do you do it?', type: 'speaking', skill: 'speaking', targetLevel: 'A2' },

  // ── Intermediate (B1 / B2) ──────────────────────────────────────────────────
  { id: 'sp_b1_1', text: 'Describe a memorable holiday or trip you took. Where did you go, and what made it special?', type: 'speaking', skill: 'speaking', targetLevel: 'B1' },
  { id: 'sp_b1_2', text: 'Talk about your personal or professional goals for the next three years and how you plan to achieve them.', type: 'speaking', skill: 'speaking', targetLevel: 'B1' },
  { id: 'sp_b2_1', text: 'Discuss the advantages and disadvantages of remote working compared to traditional office environments.', type: 'speaking', skill: 'speaking', targetLevel: 'B2' },
  { id: 'sp_b2_2', text: 'How has smartphones and social media changed the way people build real-life relationships today?', type: 'speaking', skill: 'speaking', targetLevel: 'B2' },

  // ── Advanced (C1 / C2) ──────────────────────────────────────────────────────
  { id: 'sp_c1_1', text: 'Analyze the impact of artificial intelligence on future job opportunities and the education system.', type: 'speaking', skill: 'speaking', targetLevel: 'C1' },
  { id: 'sp_c1_2', text: 'Do you believe global climate policies should prioritize economic expansion or environmental conservation? Justify your view.', type: 'speaking', skill: 'speaking', targetLevel: 'C1' },
  { id: 'sp_c2_1', text: 'Evaluate how recommendation algorithms in digital media influence public opinions and shape contemporary cultural trends.', type: 'speaking', skill: 'speaking', targetLevel: 'C2' },
];

export const QUESTION_BANK: QuestionBankItem[] = [
  ...MCQ_1000_BANK,
  ...WRITING_QUESTION_BANK,
];

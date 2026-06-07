--
-- PostgreSQL database dump
--

\restrict c8lVXgtSz2CDvwLZpcIUuYRPGBsYG5mqSAz9BR9XL5UxBexbGJWIKHZNqPHpmkO

-- Dumped from database version 13.22
-- Dumped by pg_dump version 13.22

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aid_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aid_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    urgency text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    documents jsonb,
    location text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    category text NOT NULL,
    goal_amount numeric(10,2) NOT NULL,
    raised_amount numeric(10,2) DEFAULT '0'::numeric,
    start_date timestamp without time zone DEFAULT now(),
    end_date timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    urgent boolean DEFAULT false,
    location text,
    created_at timestamp without time zone DEFAULT now(),
    archived boolean DEFAULT false
);


--
-- Name: donations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    campaign_id character varying NOT NULL,
    donor_id character varying,
    amount numeric(10,2) NOT NULL,
    anonymous boolean DEFAULT false,
    message text,
    payment_method text NOT NULL,
    transaction_id text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image text,
    author jsonb NOT NULL,
    campaign_id character varying,
    published boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    author_id character varying
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'donor'::text NOT NULL,
    avatar text,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    verification_token text,
    blocked boolean DEFAULT false NOT NULL
);


--
-- Name: volunteers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    campaign_id character varying,
    skills jsonb,
    availability text,
    experience text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Data for Name: aid_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aid_requests (id, user_id, title, description, category, urgency, status, documents, location, created_at, updated_at) FROM stdin;
aba8799b-df37-49cc-8cc1-cb3e7f06e508	b4dcc183-4563-4cf2-a96d-7016faeed87f	I am suffering from chronic depression as I lost all my property in a robbery.	I don’t know where to begin… My life has been shattered. In a single robbery, I lost everything I owned—every piece of security, every hope for tomorrow. Now I am left battling chronic depression, stripped of property, dignity, and peace of mind. I am reaching out in desperation, pleading for aid to survive and rebuild from nothing.	other	high	under_review	[]	Lamberet	2026-05-31 19:03:36.986121	2026-05-31 16:08:27.804
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaigns (id, title, description, image, category, goal_amount, raised_amount, start_date, end_date, status, urgent, location, created_at, archived) FROM stdin;
d96e7c51-f486-4966-a753-b3c4ed555b72	Emergency Food Distribution	Children in Godana Shawer are going hungry. Homeless and vulnerable, they face the streets without food, safety, or hope. Together, we can change this—your support can bring nourishment, shelter, and a chance at a brighter future.	/uploads/image-1780219082614-589914373.jpg	Disaster Relief	50000.00	35000.00	2026-05-31 09:17:56.653	2026-06-20 09:17:56.653	active	t	Northern Ethiopia	2026-03-13 21:33:04.399685	f
031ebfb8-7f60-4640-ad8e-79df9cfa42bb	School Supplies for 500 Students	Equip underprivileged children with essential school supplies, textbooks, and learning materials for the academic year.	https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80	Education	25000.00	18500.00	2026-03-12 20:13:11.356685	2026-07-26 20:13:11.356685	active	f	Addis Ababa	2026-03-12 20:13:11.356685	f
f1dc3bd6-c431-48f3-ab0c-609a5a4e794a	Medical Equipment for Rural Clinics	Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80	Healthcare	150000.00	90000.00	2026-03-13 21:33:04.399685	2026-06-22 20:13:11.356685	active	f	Various Regions	2026-03-13 21:33:04.399685	f
0a0ea693-7602-4f88-9437-4b83e97aa44d	Clean Water Wells for Rural Communities	Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.	https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80	Healthcare	75000.00	75000.00	2026-03-13 21:34:36.690634	2026-04-27 21:34:36.690634	active	f	Rural Ethiopia	2026-03-13 21:34:36.690634	t
fa21fe98-2d81-464d-82cf-89bc9f04e3e6	Medical Equipment for Rural Clinics	Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80	Healthcare	12000.00	1000.00	2026-03-12 20:13:11.356685	2026-06-14 20:13:11.356685	active	f	Various Regions	2026-03-12 20:13:11.356685	f
91e55638-1e48-473c-8ba9-467667be7725	Clean Water Wells for Rural Communities	Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.	https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80	Healthcare	75000.00	23000.00	2026-03-12 20:13:11.356685	2026-06-27 21:34:36.690634	active	f	Rural Ethiopia	2026-03-12 20:13:11.356685	f
0ab8835e-4b47-4ffc-bddf-c3d3377797fc	Emergency Food Distribution	Distribute emergency food packages to families affected by drought in northern regions.	https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80	Disaster Relief	50000.00	45001.00	2026-03-12 20:13:11.356685	2026-06-19 20:13:11.356685	active	t	Northern Ethiopia	2026-03-12 20:13:11.356685	f
aff4c7f1-37ab-4df9-9478-4868e77d73bf	Light for Learning: Empowering Rural Schools	In the remote village of Goba, Ethiopia, children walk miles each day to attend a small school that lacks electricity. When the sun sets, classrooms fall silent, and students cannot continue their studies. Teachers struggle to prepare lessons, and the community’s dream of education remains dim.\r\n\r\nThis campaign seeks to change that. By installing solar-powered lighting and providing basic educational resources, we will transform the school into a beacon of hope. With light, students can study after sunset, teachers can prepare lessons more effectively, and the entire community will benefit from a brighter future.\r\n\r\nEvery contribution brings us closer to empowering these children with the gift of knowledge and opportunity.	https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80	Education	150000.00	0.00	2026-03-13 21:34:36.69	2026-09-09 21:34:36.69	active	f	Goba, Bale Zone, Oromia Region, Ethiopia	2026-03-13 21:34:36.690634	f
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.donations (id, campaign_id, donor_id, amount, anonymous, message, payment_method, transaction_id, created_at) FROM stdin;
72ad8883-fbbc-4441-9d5b-7ed09d888209	0a0ea693-7602-4f88-9437-4b83e97aa44d	66dd5a08-6477-47a0-b9b4-8b96fda687d8	1000.00	f		chapa	donation_1780231475776_0485hvfs	2026-05-31 15:45:20.901875
940aaa79-da5f-4829-99e3-498379b23671	0a0ea693-7602-4f88-9437-4b83e97aa44d	66dd5a08-6477-47a0-b9b4-8b96fda687d8	22000.00	f		chapa	donation_1780233434156_lyxftdoy	2026-05-31 16:18:44.045535
994c1464-dcba-4576-953e-c80896e03800	0ab8835e-4b47-4ffc-bddf-c3d3377797fc	66dd5a08-6477-47a0-b9b4-8b96fda687d8	10001.00	f		chapa	donation_1780238303210_zuj6oddi	2026-05-31 17:40:31.366094
dfa40d57-45d3-40c5-b20b-89700cda5a6c	fa21fe98-2d81-464d-82cf-89bc9f04e3e6	c1789b66-bc3d-4149-b617-3877034f28ec	1000.00	f		chapa	donation_1780242184878_lhgkssey	2026-05-31 18:43:53.980375
9f6373f5-681d-432d-b1f0-aeb7f76a9a70	f1dc3bd6-c431-48f3-ab0c-609a5a4e794a	73b43f93-0e58-41eb-b099-e3f31d7fbfa1	90000.00	f		chapa	donation_1780240506247_jt11n709	2026-05-31 18:15:40.279754
43fd036a-b592-4324-9773-71a6918dc0a7	d96e7c51-f486-4966-a753-b3c4ed555b72	b65b3848-916d-4112-96e6-5d2f83a1c810	35000.00	f	\N	chapa	donation_4901231475776_0485hvfs	2026-06-06 12:11:46.00773
f44bee2f-3c7b-4a0a-8915-2cb41e842a1d	91e55638-1e48-473c-8ba9-467667be7725	66dd5a08-6477-47a0-b9b4-8b96fda687d8	23000.00	f	\N	chapa	donation_6781231475776_0485hvfs	2026-06-06 12:21:22.072481
f69becbd-0dba-4715-b4c9-e78dc27af228	0ab8835e-4b47-4ffc-bddf-c3d3377797fc	d2b2dfca-8c97-4a25-8f47-ac9223500393	35000.00	f	\N	chapa	donation_2489231475776_0485hvfs	2026-06-06 12:26:39.728863
ce3f0767-f16a-4fa3-af64-84363d0fffbe	031ebfb8-7f60-4640-ad8e-79df9cfa42bb	f068ee44-93b4-4fbb-815c-53d55c180203	18500.00	f	\N	chapa	donation_9872231475776_0485hvfs	2026-06-06 12:32:28.244438
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
Kq9ox7TGOgt8_MlwHaTErMudVnUuJhIS	{"cookie":{"originalMaxAge":86400000,"expires":"2026-06-07T22:08:19.533Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-06-08 01:08:20
QCSk1NqOLjUK-IkqaGvr0xmJDoiooLff	{"cookie":{"originalMaxAge":86400000,"expires":"2026-06-08T08:44:07.111Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"66dd5a08-6477-47a0-b9b4-8b96fda687d8"}}	2026-06-08 11:44:08
Cewo1PNud7UpRyDqMbQYrr__EwIwRqMH	{"cookie":{"originalMaxAge":86400000,"expires":"2026-06-08T11:41:31.386Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"66dd5a08-6477-47a0-b9b4-8b96fda687d8"}}	2026-06-08 15:33:27
1c5USr_zCc8B3uW7KIxAC4PUrNE6J3iq	{"cookie":{"originalMaxAge":86400000,"expires":"2026-06-08T14:21:53.626Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"66dd5a08-6477-47a0-b9b4-8b96fda687d8"}}	2026-06-08 19:33:03
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stories (id, title, content, image, author, campaign_id, published, created_at, author_id) FROM stdin;
8052c888-acbe-4626-a234-d6c611723201	My First Donation Made a Difference	As a donor, I was hesitant at first, but seeing the impact of my contribution to the children restored my faith in giving. The families now have clothes to dress their children, and it's all thanks to platforms like Welfare that connect donors directly to those in need.	/attached_assets/Story!.jpg	{"name": "Bemnet Suleman", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=WL"}	91e55638-1e48-473c-8ba9-467667be7725	t	2026-03-16 10:44:37.213947	\N
cc4dd2b6-f04f-4ced-b5b6-58a7765104b7	Medical Aid That Heals	Volunteering to set up medical equipment in rural clinics showed me the power of community. The doctors can now treat more patients, and lives are being saved every day. It's rewarding to be part of something so meaningful.	/attached_assets/Story5.jpg	{"name": "Sarah Johnson", "role": "donor", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}	fa21fe98-2d81-464d-82cf-89bc9f04e3e6	t	2026-02-24 10:44:37.213947	\N
d3e85ac5-c06c-4c68-ac63-9e91277255b2	From Homeless to Housed	As a volunteer, the emergency aid from Welfare literally saved the families. They lost their home in the floods and war, but the donations provided shelter, food, and hope. Now we're rebuilding, and I volunteer to help others in similar situations.	/attached_assets/Story3.jpg	{"name": "Wegadras", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RC"}	\N	t	2026-03-06 10:44:37.213947	\N
55821f18-08e3-4111-99e5-5e30ede27137	Helping those in need through my students charity web platform	Thanks to those aspiring children that I love to teach, I have helped lives and changed my whole perspective about charity.I am very thankful!	/uploads/image-1780493946206-954785393.jpg	{"name": "Henok Yared", "role": "Staff", "avatar": "/uploads/image-1780493946206-954785393.jpg"}	f1dc3bd6-c431-48f3-ab0c-609a5a4e794a	t	2026-06-03 16:39:06.252197	73b43f93-0e58-41eb-b099-e3f31d7fbfa1
a7d5e569-6b71-4bb3-b389-17dda71d3a73	From Crisis to Hope	After losing everything in the floods, the emergency relief provided by Welfare gave our family hope for the future. We are rebuilding our lives thanks to generous donors. Special thanks to Bemnet Suleman	/attached_assets/yihune.jpeg	{"name": "Yihune Tarekegn", "role": "Beneficiary", "avatar": "/attached_assets/yihune.jpeg"}	\N	t	2026-03-21 10:44:37.213947	b4dcc183-4563-4cf2-a96d-7016faeed87f
f0817afd-b513-4727-b42c-7522d7b9c3ba	Volunteering Changed My Life	Volunteering with Welfare has been the most rewarding experience of my life. Seeing children smile when they receive their school supplies reminds me why I do this.	/attached_assets/Hero.jpg	{"name": "Mehanayim Solomon", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=z3"}	031ebfb8-7f60-4640-ad8e-79df9cfa42bb	t	2026-03-29 10:44:37.213947	\N
4e6abedb-21b2-4433-82c4-a360e39c00cb	I helped and got involved in charity	Amazing! I can't describe the feelings. It was such an amazing experience.	/attached_assets/yihune.jpeg	{"name": "Bemnet Suleman", "role": "Staff", "avatar": "/attached_assets/yihune.jpeg"}	0a0ea693-7602-4f88-9437-4b83e97aa44d	f	2026-06-03 14:00:12.399085	\N
7d73d1ae-e1a7-4aa1-93aa-d4890caabc94	A Life Saved	The medical supplies donated through Welfare saved my son's life. When the hospital ran out of critical medications, these generous donors stepped in. I will be forever grateful.	/attached_assets/Story2.jpg	{"name": "David L. Johnson", "role": "Donor", "avatar": "/attached_assets/Story2.jpg"}	\N	t	2026-04-03 10:42:11.672714	d2b2dfca-8c97-4a25-8f47-ac9223500393
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, full_name, role, avatar, verified, created_at, verification_token, blocked) FROM stdin;
c1789b66-bc3d-4149-b617-3877034f28ec	sarah_volunteer	$2b$10$hashedpassword5	sarah@example.com	Sarah Johnson	donor	https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah	f	2026-03-12 20:13:10.70762	\N	f
35ee2066-396c-4673-be02-6c857e281ec9	redcross	$2b$10$hashedpassword1	contact@redcross.et	Red Cross Ethiopia	beneficiary	https://api.dicebear.com/7.x/initials/svg?seed=RC	t	2026-03-12 20:13:10.70762	\N	f
37c447a9-0ab3-4097-b98f-1fedcff3cb87	yihune@gmail.com	qawsedrf	yihune@gmail.com	Yihune Tarekegn	donor	\N	f	2026-03-19 20:51:10.293351	\N	f
49a8fb0a-5b1c-421b-bcbf-f5540642ab6b	ACHE	$2b$10$epSWo1EAvN4b7HDrNupeSO1OmTnwqMw38mzmYoffxZeOed0vCTm6.	at@gmail.com	ACHALU THE DONOR	donor	/uploads/avatar-1776162409631-188898397.jpg	f	2026-03-21 17:21:38.174554	\N	f
f068ee44-93b4-4fbb-815c-53d55c180203	mehanayim@gmail.com	$2b$10$3ZXzMo/KtZtQRpwgnBsxYuDRqtNwkb9Ick2sIvYGRrYVtCj62oJ4C	mehanayim@gmail.com	Mehanayim Solomon	donor	\N	t	2026-06-06 12:28:31.663671	\N	f
b65b3848-916d-4112-96e6-5d2f83a1c810	teketelewbelete99@gmail.com	$2b$10$2RL/xHNIMFoz6q2pMvfSlOW6WOU/bQxJ0fYtZAXehwfCiywDtvJ0W	teketelewbelete99@gmail.com	Teketelew Belete	donor	\N	t	2026-05-31 19:14:13.458467	fd5e0ac0-3a10-41f4-afcb-fbbdbaede0db	f
27912aff-07bc-4a4b-a568-35c2bad609e5	Bemnet	$2b$10$B1jtEevHs5Y7rhMANbCgr.NLp/3PNR3YJlMb0gs3L4/rbO3j.LKrG	mesaygstadik@gmail.com	Bemnet Suleman	donor	https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha	t	2026-03-20 23:35:33.727484	\N	t
01e7ccf5-d57a-40d2-8da9-d574ad741c67	waterlife	$2b$10$hashedpassword2	info@waterlife.org	Water for Life	donor	https://api.dicebear.com/7.x/initials/svg?seed=WL	t	2026-03-12 20:13:10.70762	\N	t
73b43f93-0e58-41eb-b099-e3f31d7fbfa1	henok_2@yahoo.com	$2b$10$NeA3PLIYXkznm1r3pTNI6u7XYGi1B/aAuxB8qkJeDm/CMVyxj/Jym	henok_2@yahoo.com	Henok Yared	donor	\N	f	2026-05-30 19:40:51.483506	\N	f
ef218b39-ddbe-43af-9c27-2389109522cd	90809@gmail.com	$2b$10$mTUPgDEA3pO9LP9Ua6v/6ewwgGzmS4W2RzoJsUBomVp7.XTlXSdPm	90809@gmail.com	Henok Yared	donor	\N	f	2026-03-19 21:31:15.818936	\N	f
ecf9965a-8f2b-4d79-8ba9-66dc70d7e9cd	Ozone	$2b$10$LNM3/nEO0mcIIGStWF11/ehzYOEedMD2FC6K6cHbYO47pi.7Q9xDu	null@gmail.com	Charity Admin	admin	/uploads/avatar-1778513618235-804524338.png	t	2026-04-14 16:15:19.929264	\N	f
b4dcc183-4563-4cf2-a96d-7016faeed87f	Yihune	$2b$10$x5vYaI/1r4kElt160QCXLeszgn/8wgszbl92iJZrIfdHnYXTA8Wey	exampleBeneficiary@gmail.com	Yihune Tarekegn	beneficiary	/uploads/avatar-1776174888038-911824092.jpg	t	2026-04-14 16:25:08.255324	\N	f
66dd5a08-6477-47a0-b9b4-8b96fda687d8	Bems	$2b$10$kT3UHbyfRKnhvbxJVe7.MusGou.S3DNLi.gZHsilSlHkikNXdlPRy	exampleDonor@gmail.com	Bemnet Suleman	donor	/uploads/avatar-1776173217832-466025604.jpg	t	2026-04-14 16:24:02.290576	\N	f
d2b2dfca-8c97-4a25-8f47-ac9223500393	john_donor	$2b$10$hashedpassword4	john@example.com	John Smith	donor	https://api.dicebear.com/7.x/avataaars/svg?seed=John	t	2026-03-12 20:13:10.70762	\N	f
862004ca-065f-4d4a-b939-ff0751e3e0d6	sysadmin	$2b$10$6CVQsfLYt1/tlXNbeZiPN.5PdJlzn2LwWlyIu/N947NTTB.w8Nih.	sysadmin@example.com	System Administrator	system_admin	\N	t	2026-05-11 17:53:19.152092	\N	f
cb15ea9f-c991-4300-a0b7-76b345b3f894	educationfirst	$2b$10$hashedpassword3	contact@educationfirst.et	Education First	donor	https://api.dicebear.com/7.x/initials/svg?seed=EF	t	2026-03-12 20:13:10.70762	\N	f
\.


--
-- Data for Name: volunteers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteers (id, user_id, campaign_id, skills, availability, experience, status, created_at) FROM stdin;
94355673-e0f8-4232-90e5-2a65a8743be5	66dd5a08-6477-47a0-b9b4-8b96fda687d8	aff4c7f1-37ab-4df9-9478-4868e77d73bf	["communication skills"]	Flexible	I have the network to help achieve this goal.	approved	2026-06-07 14:42:40.946356
d1abbaf8-3ed2-4a11-a53c-a5390ebd1825	862004ca-065f-4d4a-b939-ff0751e3e0d6	0ab8835e-4b47-4ffc-bddf-c3d3377797fc	["Community Support", "Able to withstand bad humor", "Able to stand when he greets strangers"]	Not flexible, all school days	Yihune needs a study partner, finals are comng up. Please take this opportunity , we will pay you please we are begging!	approved	2026-06-07 14:48:08.337573
f3cbb316-3b74-4178-9780-06a577ae1a2b	862004ca-065f-4d4a-b939-ff0751e3e0d6	aff4c7f1-37ab-4df9-9478-4868e77d73bf	["Community Support", "communication skills", "Translation"]	Flexible / Weekends	Delivering the solar powered lighting devices and actually delivering to the kids.	approved	2026-06-07 14:40:06.125353
d35acb6c-4134-4f72-96ff-9154a7153803	f068ee44-93b4-4fbb-815c-53d55c180203	0ab8835e-4b47-4ffc-bddf-c3d3377797fc	["Able to withstand bad humor", "Able to stand when he greets strangers", "Have extremely high tolerance"]	afternoons	i will do it. i will be the sacrificial lamb.	pending	2026-06-07 17:02:54.752913
4ae9a6ef-6ec0-4810-a638-0fbc5ca19adb	862004ca-065f-4d4a-b939-ff0751e3e0d6	fa21fe98-2d81-464d-82cf-89bc9f04e3e6	["Basic technical knowledge of medical devices (training provided)", "Logistics and inventory management", "Problem‑solving in resource‑limited settings", "#HealthcareAccess ", "#RuralDevelopment "]	Commitment: 6–8 hours per week  Duration: Minimum 3 months (renewable)  Schedule: Flexible weekday or weekend shifts; occasional field visits (1–2 times per month)	Assist in cataloging, transporting, and maintaining donated medical equipment for rural health centers.\n\nSupport local staff in setting up and training on basic usage of devices (e.g., diagnostic kits, sterilization units).\n\nDocument equipment condition and usage reports for transparency and accountability.\n\nCoordinate with partner NGOs and local clinics to ensure equitable distribution.\n\nPreferred Background: Students or professionals in health sciences, biomedical engineering, logistics, or community development.\n\nTraining Provided: Orientation on rural healthcare challenges, equipment handling basics, and reporting standards.\n\nImpact Goal: Strengthen rural clinics’ capacity to deliver essential healthcare services by bridging equipment gaps.	approved	2026-06-07 17:17:22.675496
\.


--
-- Name: aid_requests aid_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aid_requests
    ADD CONSTRAINT aid_requests_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: volunteers volunteers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: aid_requests aid_requests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aid_requests
    ADD CONSTRAINT aid_requests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: donations donations_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: donations donations_donor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donor_id_users_id_fk FOREIGN KEY (donor_id) REFERENCES public.users(id);


--
-- Name: stories stories_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: stories stories_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: volunteers volunteers_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: volunteers volunteers_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict c8lVXgtSz2CDvwLZpcIUuYRPGBsYG5mqSAz9BR9XL5UxBexbGJWIKHZNqPHpmkO


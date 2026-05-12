--
-- PostgreSQL database dump
--

\restrict fDb2eOc8ArLim5BjL4gqbriUBdGQx1qzmabWTW8QPZ2VjuceemZlAEPtzmLVJLe

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
    created_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
    created_at timestamp without time zone DEFAULT now()
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
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaigns (id, title, description, image, category, goal_amount, raised_amount, start_date, end_date, status, urgent, location, created_at) FROM stdin;
91e55638-1e48-473c-8ba9-467667be7725	Clean Water Wells for Rural Communities	Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.	https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80	Healthcare	75000.00	52000.00	2026-03-12 20:13:11.356685	2026-04-26 20:13:11.356685	active	f	Rural Ethiopia	2026-03-12 20:13:11.356685
031ebfb8-7f60-4640-ad8e-79df9cfa42bb	School Supplies for 500 Students	Equip underprivileged children with essential school supplies, textbooks, and learning materials for the academic year.	https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80	Education	25000.00	18500.00	2026-03-12 20:13:11.356685	2026-05-11 20:13:11.356685	active	f	Addis Ababa	2026-03-12 20:13:11.356685
fa21fe98-2d81-464d-82cf-89bc9f04e3e6	Medical Equipment for Rural Clinics	Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80	Healthcare	150000.00	89000.00	2026-03-12 20:13:11.356685	2026-06-10 20:13:11.356685	active	f	Various Regions	2026-03-12 20:13:11.356685
0ab8835e-4b47-4ffc-bddf-c3d3377797fc	Emergency Food Distribution	Distribute emergency food packages to families affected by drought in northern regions.	https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80	Disaster Relief	50000.00	35000.00	2026-03-12 20:13:11.356685	2026-04-01 20:13:11.356685	active	t	Northern Ethiopia	2026-03-12 20:13:11.356685
b0d6b4df-cf1c-4b83-8b14-915258473f14	Clean Water Wells for Rural Communities	Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.	https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80	Healthcare	75000.00	52000.00	2026-03-13 21:33:04.399685	2026-04-27 21:33:04.399685	active	f	Rural Ethiopia	2026-03-13 21:33:04.399685
f1dc3bd6-c431-48f3-ab0c-609a5a4e794a	Medical Equipment for Rural Clinics	Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80	Healthcare	150000.00	89000.00	2026-03-13 21:33:04.399685	2026-06-11 21:33:04.399685	active	f	Various Regions	2026-03-13 21:33:04.399685
d96e7c51-f486-4966-a753-b3c4ed555b72	Emergency Food Distribution	Distribute emergency food packages to families affected by drought in northern regions.	https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80	Disaster Relief	50000.00	35000.00	2026-03-13 21:33:04.399685	2026-04-02 21:33:04.399685	active	t	Northern Ethiopia	2026-03-13 21:33:04.399685
0a0ea693-7602-4f88-9437-4b83e97aa44d	Clean Water Wells for Rural Communities	Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.	https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80	Healthcare	75000.00	52000.00	2026-03-13 21:34:36.690634	2026-04-27 21:34:36.690634	active	f	Rural Ethiopia	2026-03-13 21:34:36.690634
aff4c7f1-37ab-4df9-9478-4868e77d73bf	School Supplies for 500 Students	Equip underprivileged children with essential school supplies, textbooks, and learning materials for the academic year.	https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80	Education	25000.00	18500.00	2026-03-13 21:34:36.690634	2026-05-12 21:34:36.690634	active	f	Addis Ababa	2026-03-13 21:34:36.690634
39664052-0ec3-4916-a607-69c3e72bcbbe	Medical Equipment for Rural Clinics	Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80	Healthcare	150000.00	89766.00	2026-03-13 21:34:36.690634	2026-06-11 21:34:36.690634	active	f	Various Regions	2026-03-13 21:34:36.690634
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.donations (id, campaign_id, donor_id, amount, anonymous, message, payment_method, transaction_id, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
wnx88I9wVZa3dZu92Z85R2r5dF1mYLLx	{"cookie":{"originalMaxAge":86400000,"expires":"2026-05-13T15:20:58.723Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":"ecf9965a-8f2b-4d79-8ba9-66dc70d7e9cd"}}	2026-05-13 23:04:48
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stories (id, title, content, image, author, campaign_id, published, created_at) FROM stdin;
8052c888-acbe-4626-a234-d6c611723201	My First Donation Made a Difference	As a donor, I was hesitant at first, but seeing the impact of my contribution to the children restored my faith in giving. The families now have clothes to dress their children, and it's all thanks to platforms like Welfare that connect donors directly to those in need.	/attached_assets/Story!.jpg	{"name": "Bemnet Suleman", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=WL"}	91e55638-1e48-473c-8ba9-467667be7725	t	2026-03-16 10:44:37.213947
cc4dd2b6-f04f-4ced-b5b6-58a7765104b7	Medical Aid That Heals	Volunteering to set up medical equipment in rural clinics showed me the power of community. The doctors can now treat more patients, and lives are being saved every day. It's rewarding to be part of something so meaningful.	/attached_assets/Story5.jpg	{"name": "Sarah Johnson", "role": "donor", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}	fa21fe98-2d81-464d-82cf-89bc9f04e3e6	t	2026-02-24 10:44:37.213947
d3e85ac5-c06c-4c68-ac63-9e91277255b2	From Homeless to Housed	As a volunteer, the emergency aid from Welfare literally saved the families. They lost their home in the floods and war, but the donations provided shelter, food, and hope. Now we're rebuilding, and I volunteer to help others in similar situations.	/attached_assets/Story3.jpg	{"name": "Wegadras", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RC"}	\N	t	2026-03-06 10:44:37.213947
7d73d1ae-e1a7-4aa1-93aa-d4890caabc94	A Life Saved	The medical supplies donated through Welfare saved my son's life. When the hospital ran out of critical medications, these generous donors stepped in. I will be forever grateful.	/attached_assets/Story2.jpg	{"name": "David L. Johnson", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=WL"}	\N	t	2026-04-03 10:42:11.672714
a7d5e569-6b71-4bb3-b389-17dda71d3a73	From Crisis to Hope	After losing everything in the floods, the emergency relief provided by Welfare gave our family hope for the future. We are rebuilding our lives thanks to generous donors.	/attached_assets/yihune.jpeg	{"name": "Yihune Tarekegn", "role": "Beneficiary", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=aa"}	\N	t	2026-03-21 10:44:37.213947
f0817afd-b513-4727-b42c-7522d7b9c3ba	Volunteering Changed My Life	Volunteering with Welfare has been the most rewarding experience of my life. Seeing children smile when they receive their school supplies reminds me why I do this.	/attached_assets/Hero.jpg	{"name": "Mehanayim Solomon", "role": "volunteer", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=z3"}	031ebfb8-7f60-4640-ad8e-79df9cfa42bb	t	2026-03-29 10:44:37.213947
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, full_name, role, avatar, verified, created_at) FROM stdin;
01e7ccf5-d57a-40d2-8da9-d574ad741c67	waterlife	$2b$10$hashedpassword2	info@waterlife.org	Water for Life	organizer	https://api.dicebear.com/7.x/initials/svg?seed=WL	t	2026-03-12 20:13:10.70762
cb15ea9f-c991-4300-a0b7-76b345b3f894	educationfirst	$2b$10$hashedpassword3	contact@educationfirst.et	Education First	organizer	https://api.dicebear.com/7.x/initials/svg?seed=EF	t	2026-03-12 20:13:10.70762
d2b2dfca-8c97-4a25-8f47-ac9223500393	john_donor	$2b$10$hashedpassword4	john@example.com	John Smith	donor	https://api.dicebear.com/7.x/avataaars/svg?seed=John	f	2026-03-12 20:13:10.70762
c1789b66-bc3d-4149-b617-3877034f28ec	sarah_volunteer	$2b$10$hashedpassword5	sarah@example.com	Sarah Johnson	donor	https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah	f	2026-03-12 20:13:10.70762
35ee2066-396c-4673-be02-6c857e281ec9	redcross	$2b$10$hashedpassword1	contact@redcross.et	Red Cross Ethiopia	beneficiary	https://api.dicebear.com/7.x/initials/svg?seed=RC	t	2026-03-12 20:13:10.70762
37c447a9-0ab3-4097-b98f-1fedcff3cb87	yihune@gmail.com	qawsedrf	yihune@gmail.com	Yihune Tarekegn	donor	\N	f	2026-03-19 20:51:10.293351
ef218b39-ddbe-43af-9c27-2389109522cd	90809@gmail.com	$2b$10$mTUPgDEA3pO9LP9Ua6v/6ewwgGzmS4W2RzoJsUBomVp7.XTlXSdPm	90809@gmail.com	Henok Yared	organizer	\N	f	2026-03-19 21:31:15.818936
49a8fb0a-5b1c-421b-bcbf-f5540642ab6b	ACHE	$2b$10$epSWo1EAvN4b7HDrNupeSO1OmTnwqMw38mzmYoffxZeOed0vCTm6.	at@gmail.com	ACHALU THE DONOR	volunteer	/uploads/avatar-1776162409631-188898397.jpg	f	2026-03-21 17:21:38.174554
27912aff-07bc-4a4b-a568-35c2bad609e5	Bemnet	$2b$10$B1jtEevHs5Y7rhMANbCgr.NLp/3PNR3YJlMb0gs3L4/rbO3j.LKrG	mesaygstadik@gmail.com	Bemnet Suleman	admin	https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha	f	2026-03-20 23:35:33.727484
66dd5a08-6477-47a0-b9b4-8b96fda687d8	Bems	$2b$10$kT3UHbyfRKnhvbxJVe7.MusGou.S3DNLi.gZHsilSlHkikNXdlPRy	exampleDonor@gmail.com	Bemnet Suleman	donor	/uploads/avatar-1776173217832-466025604.jpg	f	2026-04-14 16:24:02.290576
b4dcc183-4563-4cf2-a96d-7016faeed87f	Yihune	$2b$10$x5vYaI/1r4kElt160QCXLeszgn/8wgszbl92iJZrIfdHnYXTA8Wey	exampleBeneficiary@gmail.com	Yihune Tarekegn	beneficiary	/uploads/avatar-1776174888038-911824092.jpg	f	2026-04-14 16:25:08.255324
ecf9965a-8f2b-4d79-8ba9-66dc70d7e9cd	Ozone	$2b$10$LNM3/nEO0mcIIGStWF11/ehzYOEedMD2FC6K6cHbYO47pi.7Q9xDu	null@gmail.com	Charity Admin	admin	/uploads/avatar-1778513618235-804524338.png	f	2026-04-14 16:15:19.929264
862004ca-065f-4d4a-b939-ff0751e3e0d6	sysadmin	$2b$10$6CVQsfLYt1/tlXNbeZiPN.5PdJlzn2LwWlyIu/N947NTTB.w8Nih.	sysadmin@example.com	System Administrator	system_admin	\N	t	2026-05-11 17:53:19.152092
\.


--
-- Data for Name: volunteers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteers (id, user_id, campaign_id, skills, availability, experience, status, created_at) FROM stdin;
2be11f9f-abec-4b77-b723-f58395a7f051	c1789b66-bc3d-4149-b617-3877034f28ec	031ebfb8-7f60-4640-ad8e-79df9cfa42bb	["teaching", "organization", "logistics"]	weekends	5 years in education volunteering	approved	2026-02-26 20:13:11.608867
fe68d79e-0402-4b62-9b5f-63d231d58e9f	d2b2dfca-8c97-4a25-8f47-ac9223500393	91e55638-1e48-473c-8ba9-467667be7725	["engineering", "construction", "project management"]	full-time	10 years in water infrastructure	approved	2026-03-02 20:13:11.608867
1109d37a-64a8-4814-b08a-1702bedc4c67	c1789b66-bc3d-4149-b617-3877034f28ec	fa21fe98-2d81-464d-82cf-89bc9f04e3e6	["medical", "logistics", "coordination"]	part-time	3 years in healthcare volunteering	approved	2026-03-07 20:13:11.608867
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

\unrestrict fDb2eOc8ArLim5BjL4gqbriUBdGQx1qzmabWTW8QPZ2VjuceemZlAEPtzmLVJLe


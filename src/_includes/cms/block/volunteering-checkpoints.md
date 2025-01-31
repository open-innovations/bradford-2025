---
reference: volunteering-checkpoints
---
{{# TODO add statement about corporate volunteer numbers. Large partners? #}}

{{# TODO Comments from Comms
It says volunteers onboarding process was officially launched in Sept 2024 but above
it says volunteer evets took place from August 2024.
#}}
{{# TODO Comments from Comms
Also, the graph says inductions didn’t start until after Oct but shifts started in August –
is the graph correct? 
#}}
{{# TODO Feedback from John S-R (Volunteering)
Yes recruitment will happen all the way across 2025. We’re looking at one large induction
per month (100 capacity) along with smaller local inductions.  The target of 3,500 includes
2000 corporate volunteers. We are aiming for 1780 mainstream volunteers. So the real target
is more like 3780 volunteers.
#}}
{{# TODO Get names of early events that volunteers have supported #}}

We've been steadily recruiting volunteers throughout 2024. There are now a total of <b>{{ summary['Signed up'] }}</b> people signed up as prospective Bradford 2025 volunteers.

We launched the formal volunteer induction process in September 2024. This will continue throughout 2025. We’re planning to hold one large induction event per month along with other smaller local inductions. The induction process comprises three checkpoints:

<dl>
    <dt>Sign up</dt>
        <dd>
            {{# TODO check wording #}}
            {{# TODO Comments from Comms
            It says ‘The monitoring and evaluation form is completed during the first checkpoint.
            This form captures important information…’ I think this needs to come out as we haven’t
            captured all the demographics. 
            #}}
            The first step is to sign up. During this checkpoint the prospective volunteers
            fill in an application form to collect key information that we use to track the
            volunteering process.
            There are currently <b>{{ summary['Signed up'] - summary['Induction booked'] }}</b>
            people in this checkpoint.
        </dd>

    <dt>Induction booked</dt>
        <dd>
            {{# TODO Comments from Comms
            Induction booked 
            Are the 690 people who have an induction booked included in the 336 who have completed
            the induction or is it separate. If so, shouldn’t it add up to 1,186?
            #}}
            {{# TODO Is the aspiration to have all volunteers through the induction process? #}}
            Once they've completed their forms, we book the volunteers onto an induction
            session to cover all the important information they'll need as Bradford 2025 volunteers.
            At the moment, <b>{{ summary['Induction booked'] - summary['Induction completed'] }}</b>
            people are booked onto induction sessions.
        </dd>

    <dt>Induction completed</dt>
        <dd>
            {{# TODO Is the aspiration to have all volunteers through the induction process? #}}
            {{# TODO check how often volunteering induction sessions run #}}
            {{# TODO Comments from Comms
            We’re four weeks away from Jan and we still have a lot of inductions to do, so the graph
            makes it look like we’re not ready for 2025. 
            #}}
            Having attended an induction session, our volunteers are fully equipped to fulfil their
            role as Bradford 2025 volunteers.
            To date, <b>{{ summary['Induction completed'] }}</b>
            people have completed their volunteering induction.
        </dd>
</dl>



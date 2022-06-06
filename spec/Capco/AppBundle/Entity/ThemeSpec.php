<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use PhpSpec\ObjectBehavior;

class ThemeSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Theme::class);
    }

    public function it_count_X_events_enabled(
        Event $event1,
        Event $event2,
        Event $event3,
        Event $event4,
        Event $event5
    ) {
        $event1->isEnabled()->willReturn(true);
        $event2->isEnabled()->willReturn(true);
        $event3->isEnabled()->willReturn(true);
        $event4->isEnabled()->willReturn(false);
        $event5->isEnabled()->willReturn(false);

        $events = [
            $event1->getWrappedObject(),
            $event2->getWrappedObject(),
            $event3->getWrappedObject(),
            $event4->getWrappedObject(),
            $event5->getWrappedObject(),
        ];
        $this->setEvents($events);

        $this->countEnabledEvents()->shouldReturn(3);

        $event4->isEnabled()->willReturn(true);
        $this->countEnabledEvents()->shouldNotReturn(3);
        $this->countEnabledEvents()->shouldReturn(4);
    }

    public function it_count_X_posts_enabled(
        Post $post1,
        Post $post2,
        Post $post3,
        Post $post4,
        Post $post5
    ) {
        $post1->canDisplay()->willReturn(true);
        $post1->getIsPublished()->willReturn(true);

        $post2->canDisplay()->willReturn(true);
        $post2->getIsPublished()->willReturn(true);

        $post3->canDisplay()->willReturn(true);
        $post3->getIsPublished()->willReturn(true);

        $post4->canDisplay()->willReturn(true);
        $post4->getIsPublished()->willReturn(false);

        $post5->canDisplay()->willReturn(true);
        $post5->getIsPublished()->willReturn(false);

        $posts = [
            $post1->getWrappedObject(),
            $post2->getWrappedObject(),
            $post3->getWrappedObject(),
            $post4->getWrappedObject(),
            $post5->getWrappedObject(),
        ];
        $this->setPosts($posts);

        $this->countEnabledPosts()->shouldReturn(3);

        $post4->getIsPublished()->willReturn(true);
        $this->countEnabledPosts()->shouldNotReturn(3);
        $this->countEnabledPosts()->shouldReturn(4);
    }

    public function it_count_X_public_projects(
        Project $project1,
        Project $project2,
        Project $project3,
        Project $project4,
        Project $project5
    ) {
        $project1->isPublic()->willReturn(true);
        $project2->isPublic()->willReturn(true);
        $project3->isPublic()->willReturn(true);
        $project4->isPublic()->willReturn(false);
        $project5->isPublic()->willReturn(false);
        $projects = [
            $project1->getWrappedObject(),
            $project2->getWrappedObject(),
            $project3->getWrappedObject(),
            $project4->getWrappedObject(),
            $project5->getWrappedObject(),
        ];
        $this->setProjects($projects);

        $this->countEnabledProjects()->shouldReturn(3);

        $project4->isPublic()->willReturn(true);
        $this->countEnabledProjects()->shouldNotReturn(3);
        $this->countEnabledProjects()->shouldReturn(4);
    }
}

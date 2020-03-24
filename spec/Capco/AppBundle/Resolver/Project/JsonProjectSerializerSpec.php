<?php

namespace spec\Capco\AppBundle\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\Project\JsonProjectSerializer;
use Capco\AppBundle\Resolver\Project\ProjectSerializerInterface;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class JsonProjectSerializerSpec extends ObjectBehavior
{
    public function let(ProjectSerializerInterface $projectSerializer)
    {
        $this->beConstructedWith($projectSerializer);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(JsonProjectSerializer::class);
    }

    // TODO: Upgrade to PHP 7.4
    /*function it_should_serialize_an_array_of_projects(
        ProjectSerializerInterface $projectSerializer,
        Serializer $serializer
    ) {
        $projects = [
            new Project(),
            new Project(),
        ];

        $serializer->serialize($projects, 'json', Argument::type(SerializationContext::class))
            ->willReturn(json_encode($projects));

        $projectSerializer->renderProjects(Argument::type('array'))->willReturn($projects);
        $projectSerializer->getSerializer()->willReturn($serializer);

        $this->beConstructedWith($projectSerializer);

        $this->renderProjects($projects)->shouldReturn(json_encode($projects));
    }*/
}

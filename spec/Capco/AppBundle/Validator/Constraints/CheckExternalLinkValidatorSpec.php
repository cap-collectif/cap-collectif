<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Validator\Constraints\CheckExternalLink;
use Capco\AppBundle\Validator\Constraints\CheckExternalLinkValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class CheckExternalLinkValidatorSpec extends ObjectBehavior
{
    public function let(ContainerInterface $container)
    {
        $this->beConstructedWith($container);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckExternalLinkValidator::class);
    }

    public function it_should_add_violation_external_link_is_internal(
        ContainerInterface $container,
        Router $router,
        RequestContext $requestContext,
        CheckExternalLink $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $container
            ->get('router')
            ->willReturn($router)
            ->shouldBeCalled();
        $router
            ->getContext()
            ->willReturn($requestContext)
            ->shouldBeCalled();
        $requestContext
            ->getHost()
            ->willReturn('capco.dev')
            ->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $builder
            ->atPath('externalLink')
            ->willReturn($builder)
            ->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->validate('http://capco.dev/test', $constraint);
    }

    public function it_should_not_add_violation_external_link(
        ContainerInterface $container,
        Router $router,
        RequestContext $requestContext,
        CheckExternalLink $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $container
            ->get('router')
            ->willReturn($router)
            ->shouldBeCalled();
        $router
            ->getContext()
            ->willReturn($requestContext)
            ->shouldBeCalled();
        $requestContext
            ->getHost()
            ->willReturn('capco.dev')
            ->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        $this->validate('http://google.dev/test', $constraint);
    }
}

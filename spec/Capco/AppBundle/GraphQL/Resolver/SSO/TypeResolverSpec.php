<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\SSO\TypeResolver;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver as BaseTypeResolver;
use GraphQL\Type\Definition\Type;
use PhpSpec\ObjectBehavior;

class TypeResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(TypeResolver::class);
    }

    public function let(
        BaseTypeResolver $typeResolver
    ) {
        $this->beConstructedWith($typeResolver);
    }

    public function it_should_invoke_and_return_cas_sso_type(
        BaseTypeResolver $typeResolver,
        CASSSOConfiguration $data,
        Type $type
    ) {
        $typeResolver
            ->resolve('InternalCASSSOConfiguration')
            ->shouldBeCalled()
            ->willReturn($type)
        ;

        $this->__invoke($data)->shouldReturn(
            $type
        );
    }
}

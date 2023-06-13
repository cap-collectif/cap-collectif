<?php

namespace spec\Capco\AppBundle\GraphQL\Type;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\GraphQL\Type\EmailType;

class EmailTypeSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EmailType::class);
    }

    public function it_parse_email_correctly(): void {
        $this::parseValue('spyl@cap-collectif.com')->shouldBe('spyl@cap-collectif.com');
        $this::parseValue('Cécile.péon@laposte.net')->shouldBe('Cécile.péon@laposte.net');
        $this::parseValue('i am an invalid email')->shouldBe('INVALID_EMAIL');
    }
}

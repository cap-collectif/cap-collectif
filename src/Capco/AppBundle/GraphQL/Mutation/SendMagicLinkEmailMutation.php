<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\ParticipationWorkflow\MagicLinkEmailSender;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class SendMagicLinkEmailMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private MagicLinkEmailSender $magicLinkEmailSender)
    {
    }

    /**
     * @return array{'errorCode': string|null, 'confirmationUrl': string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $email = $input->offsetGet('email');
        $variant = $input->offsetGet('variant');
        $redirectUrl = $input->offsetGet('redirectUrl');

        return $this->magicLinkEmailSender->send($email, $redirectUrl, $variant);
    }
}

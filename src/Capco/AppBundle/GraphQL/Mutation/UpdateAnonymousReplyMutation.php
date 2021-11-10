<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateAnonymousReplyMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private ResponsesFormatter $responsesFormatter;
    private ReplyAnonymousRepository $replyAnonymousRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        ReplyAnonymousRepository $replyAnonymousRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->responsesFormatter = $responsesFormatter;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
    }

    public function __invoke(Argument $input): array
    {
        $reply = $this->getReply($input);
        $reply = $this->updateReply($reply, $input);
        $this->em->flush();

        return ['reply' => $reply];
    }

    private function getReply(Argument $argument): ReplyAnonymous
    {
        $hashedToken = $argument->offsetGet('hashedToken');
        $decodedToken = base64_decode($hashedToken);
        $reply = $this->replyAnonymousRepository->findOneBy(['token' => $decodedToken]);

        if (!$reply) {
            throw new UserError('Reply not found.');
        }

        return $reply;
    }

    private function updateReply(ReplyAnonymous $reply, Argument $input): ReplyAnonymous
    {
        $form = $this->formFactory->create(ReplyAnonymousType::class, $reply);
        $form->submit($this->formatValuesForForm($input), false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        return $reply;
    }

    private function formatValuesForForm(Argument $argument): array
    {
        $values = $argument->getArrayCopy();
        unset($values['hashedToken']);
        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        return $values;
    }
}

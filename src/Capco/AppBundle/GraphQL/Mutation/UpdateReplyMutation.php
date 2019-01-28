<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Symfony\Component\Form\FormFactory;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;

class UpdateReplyMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $redisStorageHelper;
    private $responsesFormatter;
    private $replyRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->responsesFormatter = $responsesFormatter;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $values = $input->getRawArguments();
        $reply = $this->replyRepo->find($values['replyId']);
        unset($values['replyId']);

        if (!$reply) {
            throw new UserError('Reply not found.');
        }

        if ($reply->getAuthor() == !$user) {
            throw new UserError('You are not allowed to update this reply.');
        }

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyType::class, $reply, []);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();
        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['reply' => $reply];
    }
}

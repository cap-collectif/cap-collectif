<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Form\OpinionVersionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ChangeVersionMutation implements MutationInterface
{
    private $em;
    private $versionRepo;
    private $formFactory;
    private $redisStorage;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        OpinionVersionRepository $versionRepo,
        RedisStorageHelper $redisStorage
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->versionRepo = $versionRepo;
        $this->redisStorage = $redisStorage;
    }

    // if (!$opinion->canContribute()) {
    //     throw new BadRequestHttpException(
    //         "Can't update a version of an uncontributable opinion."
    //     );
    // }

    // $user = $this->getUser();
    // if ($user !== $opinionVersion->getAuthor()) {
    //     throw new AccessDeniedException();
    // }

    // $form = $this->createForm(OpinionOpinionVersionType::class, $opinionVersion);
    // $form->submit($request->request->all(), false);

    // if ($form->isValid()) {
    //     $opinionVersion->resetVotes();
    //     $opinionVersion->setValidated(false);
    //     $this->getDoctrine()
    //         ->getManager()
    //         ->persist($opinionVersion);
    //     $this->getDoctrine()
    //         ->getManager()
    //         ->flush();

    //     return $opinionVersion;
    // }

    public function __invoke(Arg $input, User $user): array
    {
        $versionId = $input->offsetGet('versionId');
        $version = $this->versionRepo->find($versionId);

        if (!$version) {
            throw new UserError('Unknown version with id: ' . $versionId);
        }

        if ($user !== $version->getAuthor()) {
            throw new UserError("Can't update the version of someone else.");
        }

        if (!$version->canContribute()) {
            throw new UserError("Can't update uncontributable version.");
        }

        $values = $input->getRawArguments();
        unset($values['versionId']);

        $form = $this->formFactory->create(OpinionVersionType::class, $version);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $version->setValidated(false);
        $version->resetVotes();

        $this->em->flush();

        return ['version' => $version];
    }
}

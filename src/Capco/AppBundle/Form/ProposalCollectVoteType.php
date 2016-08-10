<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\EventListener\NoCommentWhenPrivateSubscriber;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalCollectVoteType extends AbstractType
{
    private $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->tokenStorage->getToken()->getUser()) {
            $builder
                ->add('username', 'purified_text', [
                    'required' => true,
                ])
                ->add('email', 'email', [
                    'required' => true,
                ])
            ;
        }

        $builder
            ->add('comment', 'purified_textarea', [
                'required' => false,
                'mapped' => false,
            ])
            ->add('private', null, [
                'required' => false,
            ])
            ->addEventSubscriber(new NoCommentWhenPrivateSubscriber())
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\ProposalCollectVote',
            'csrf_protection' => false,
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'proposal_collect_vote';
    }
}

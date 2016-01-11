<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\EventListener\NoCommentWhenPrivateSubscriber;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalVoteType extends AbstractType
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
                ->add('username', null, [
                    'required' => true,
                    'translation_domain' => 'CapcoAppBundle',
                ])
                ->add('email', 'email', [
                    'required' => true,
                    'translation_domain' => 'CapcoAppBundle',
                ])
            ;
        }

        $builder
            ->add('comment', 'textarea', [
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
            'data_class' => 'Capco\AppBundle\Entity\ProposalVote',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'proposal_vote';
    }
}

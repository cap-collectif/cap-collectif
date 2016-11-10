<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;

class CommentType extends AbstractType
{
    private $user;

    public function __construct(User $user = null)
    {
        $this->user = $user;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['actionType'] === 'edit') {
            $builder
                ->add('confirm',
                    CheckboxType::class, [
                    'mapped' => false,
                    'label' => 'opinion.form.confirm',
                    'required' => true,
                    'constraints' => [new IsTrue(['message' => 'opinion.votes_not_confirmed'])],
                ])
            ;
        }

        $builder->add('body', PurifiedTextareaType::class, ['required' => true]);

        if ($options['actionType'] === 'create') {
            $builder->add('parent', null, ['required' => false]);
        }

        if (!$this->user) {
            $builder
                ->add('authorName', PurifiedTextType::class, ['required' => true])
                ->add('authorEmail', EmailType::class, ['required' => true])
            ;
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Comment',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'actionType' => 'create',
        ]);
    }

    public function getName()
    {
        return '';
    }
}

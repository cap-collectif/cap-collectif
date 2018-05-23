<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;

class UserAdmin extends BaseAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'username',
    ];
    private $rolesLabels = [
        'ROLE_USER' => 'roles.user',
        'ROLE_ADMIN' => 'roles.admin',
        'ROLE_SUPER_ADMIN' => 'roles.super_admin',
    ];

    private $rolesLabelsNoSuper = [
        'ROLE_USER' => 'roles.user',
        'ROLE_ADMIN' => 'roles.admin',
    ];

    public function getFormBuilder()
    {
        $this->formOptions['data_class'] = $this->getClass();

        $options = $this->formOptions;
        $options['validation_groups'] = 'Default';
        $options['translation_domain'] = 'CapcoAppBundle';

        $formBuilder = $this->getFormContractor()->getFormBuilder($this->getUniqid(), $options);

        $this->defineFormBuilder($formBuilder);

        return $formBuilder;
    }

    public function getTemplate($name)
    {
        if ('delete' === $name) {
            return 'CapcoAdminBundle:User:delete.html.twig';
        }

        return parent::getTemplate($name);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getUsername(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getExportFormats()
    {
        return ['csv'];
    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('email')
            ->add('username')
            ->add('enabled', null, [
                'editable' => true,
            ])
            ->add('locked', null, [
                'editable' => true,
            ])
            ->add('updatedAt')
            ->add('_action', 'actions', [
                'actions' => [
                    'edit' => [
                        'template' => 'CapcoAdminBundle:User:list__action_edit.html.twig',
                    ],
                    'show' => [],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:User:list__action_delete.html.twig',
                    ],
                ],
            ])
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureDatagridFilters(DatagridMapper $filterMapper)
    {
        $filterMapper
            ->add('id')
            ->add('username')
            ->add('email')
            ->add('enabled')
            ->add('locked')
            ->add('phone', null, [
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->with('General')
            ->add('id')
            ->add('username')
            ->add('email')
            ->add('createdAt')
            ->add('updatedAt')
            ->end()
            ->with('Profile')
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:User:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
            ])
            ->add('dateOfBirth')
            ->add('firstname')
            ->add('lastname')
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('user_type')) {
            $showMapper->add('userType', null, []);
        }

        $showMapper
            ->add('gender')
            ->add('website')
            ->add('biography')
            ->add('address')
            ->add('address2')
            ->add('zipCode')
            ->add('city')
            ->add('neighborhood')
            ->add('phone')
            ->add('locale')
            ->add('timezone')
            ->end()
            ->with('Social')
            ->add('facebookUrl', 'url')
            ->add('facebook_id')
            ->add('facebook_access_token')
            ->add('linkedInUrl', 'url')
            ->add('google_id')
            ->add('google_access_token')
            ->add('twitterUrl', 'url')
            ->add('twitter_id')
            ->add('twitter_access_token')
            ->end()
            /* ->with('Security')
            ->add('token')
            ->add('twoStepVerificationCode') /
            ->end() */
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $user = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();
        $subject = $this->getSubject();

        // define group zoning
        $formMapper
            ->tab('User')
            ->with('Profile', ['class' => 'col-md-6'])->end()
            ->with('General', ['class' => 'col-md-6'])->end()
            ->with('Confidentialité', ['class' => 'col-md-6'])->end()
            ->with('Social', ['class' => 'col-md-6'])->end()
            ->end()
        ;
        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status', ['class' => 'col-md-12'])->end()
                // ->with('Keys', ['class' => 'col-md-6'])->end()
                ->with('Roles', ['class' => 'col-md-12'])->end()
                ->end()
            ;
        }

        $now = new \DateTime();

        $formMapper
            ->tab('User')
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('plainPassword', 'text', [
                'required' => (!$this->getSubject() || null === $this->getSubject()->getId()),
            ])
            ->end()
            ->with('Profile')
            ->add('media', 'sonata_type_model_list', [
                'required' => false,
            ], [
                'link_parameters' => [
                'context' => 'default',
                'hide_context' => true,
            ], ])
            ->add('dateOfBirth', 'sonata_type_date_picker', [
                'years' => range(1900, $now->format('Y')),
                'dp_min_date' => '1-1-1900',
                'dp_max_date' => $now->format('c'),
                'required' => false,
            ])
            ->add('firstname')
            ->add('lastname')
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('user_type')) {
            $formMapper->add('userType', null, [
                'required' => false,
            ]);
        }

        $formMapper
            ->add('website', 'url', ['required' => false])
            ->add('biography', 'text', ['required' => false])
            ->add('address')
            ->add('address2')
            ->add('zipCode')
            ->add('city')
            ->add('neighborhood')
            ->add('gender', 'sonata_user_gender', [
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('locale', 'locale', ['required' => false])
            ->add('timezone', 'timezone', ['required' => false])
            ->add('phone')
            ->end()
            ->with('Social')
            ->add('facebookUrl')
            ->add('linkedInUrl')
            ->add('twitterUrl')
            ->end()
        ;
        $formMapper->with('Confidentialité')
            ->add('profilePageIndexed', CheckboxType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
            ])->end()->end();

        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status')
                ->add('locked')
                ->add('expired')
                ->add('expiresAt', 'sonata_type_datetime_picker', [
                    'required' => false,
                ])
                ->add('enabled')
                ->add('confirmationToken')
            ;

            if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('phone_confirmation')) {
                $formMapper
                ->add('phoneConfirmed', null, [
                    'required' => false,
                    'read_only' => true,
                    'attr' => [
                        'disabled' => true,
                      ],
                  ])
              ;
            }

            // Roles
            $formMapper
                ->end()
                ->with('Roles')
                ->add('vip', null, [
                    'required' => false,
                ])
                ->add(
                    'realRoles',
                    'sonata_security_roles',
                    [
                        'expanded' => true,
                        'multiple' => true,
                        'required' => false,
                        'translation_domain' => 'CapcoAppBundle',
                        'choices' => $currentUser->hasRole('ROLE_SUPER_ADMIN')
                            ? $this->rolesLabels
                            : $this->rolesLabelsNoSuper,
                    ]
                )
                ->end()

                /* ->with('Keys')
                ->add('token')
                ->add('twoStepVerificationCode')
                ->end() */
            ;
        }
    }
}

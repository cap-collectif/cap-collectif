<?php

namespace Capco\AdminBundle\Admin;

use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class UserAdmin extends BaseAdmin
{
    private $rolesLabels = [
        'ROLE_USER' => 'roles.user',
        'ROLE_ADMIN' => 'roles.admin',
        'ROLE_SUPER_ADMIN' => 'roles.super_admin',
    ];

    private $rolesLabelsNoSuper = [
        'ROLE_USER' => 'roles.user',
        'ROLE_ADMIN' => 'roles.admin',
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'username',
    ];

    public function getFormBuilder()
    {
        $this->formOptions['data_class'] = $this->getClass();

        $options = $this->formOptions;
        $options['validation_groups'] = 'Default';
        $options['translation_domain'] = 'SonataUserBundle';

        $formBuilder = $this->getFormContractor()->getFormBuilder($this->getUniqid(), $options);

        $this->defineFormBuilder($formBuilder);

        return $formBuilder;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('email')
            ->add('username')
            ->add('enabled', null, array(
                'editable' => true,
            ))
            ->add('locked', null, array(
                'editable' => true,
            ))
            ->add('updatedAt')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array(
                        'template' => 'CapcoAdminBundle:User:list__action_edit.html.twig',
                    ),
                    'show' => array(),
                    'delete' => array(
                        'template' => 'CapcoAdminBundle:User:list__action_delete.html.twig',
                    ),
                ),
            ))
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
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('createdAt')
            ->add('updatedAt')
            ->end()
            ->with('Profile')
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:User:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
            ))
            ->add('dateOfBirth')
            ->add('firstname')
            ->add('lastname')
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('user_type')) {
            $showMapper->add('userType', null, array());
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
            ->add('facebook_url', 'url')
            ->add('facebook_id')
            ->add('facebook_access_token')
            ->add('google_url', 'url')
            ->add('google_id')
            ->add('google_access_token')
            ->add('twitter_url', 'url')
            ->add('twitter_id')
            ->add('twitter_access_token')
            ->end()
            ->with('Security')
            ->add('token')
            ->add('twoStepVerificationCode')
            ->end()
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $user = $this->getConfigurationPool()->getContainer()->get('security.context')->getToken()->getUser();
        $subject = $this->getSubject();

        // define group zoning
        $formMapper
            ->tab('User')
            ->with('Profile', array('class' => 'col-md-6'))->end()
            ->with('General', array('class' => 'col-md-6'))->end()
            ->with('Social', array('class' => 'col-md-6'))->end()
            ->end()
        ;
        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status', array('class' => 'col-md-6'))->end()
                ->with('Keys', array('class' => 'col-md-6'))->end()
                ->with('Roles', array('class' => 'col-md-12'))->end()
                ->end()
            ;
        }

        $now = new \DateTime();

        $formMapper
            ->tab('User')
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('plainPassword', 'text', array(
                'required' => (!$this->getSubject() || is_null($this->getSubject()->getId())),
            ))
            ->end()
            ->with('Profile')
            ->add('Media', 'sonata_type_model_list', array(
                'required' => false,
            ), array(
                'link_parameters' => array(
                'context' => 'default',
                'hide_context' => true,
            ), ))
            ->add('dateOfBirth', 'sonata_type_date_picker', array(
                'years' => range(1900, $now->format('Y')),
                'dp_min_date' => '1-1-1900',
                'dp_max_date' => $now->format('c'),
                'required' => false,
            ))
            ->add('firstname', null, array('required' => false))
            ->add('lastname', null, array('required' => false))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('user_type')) {
            $formMapper->add('userType', null, array(
                'required' => false,
            ));
        }

        $formMapper
            ->add('website', 'url', array('required' => false))
            ->add('biography', 'text', array('required' => false))
            ->add('address', null, array('required' => false))
            ->add('address2', null, array('required' => false))
            ->add('zipCode', null, array('required' => false))
            ->add('city', null, array('required' => false))
            ->add('neighborhood', null, array('required' => false))
            ->add('gender', 'sonata_user_gender', array(
                'required' => true,
                'translation_domain' => 'SonataUserBundle',
            ))
            ->add('locale', 'locale', array('required' => false))
            ->add('timezone', 'timezone', array('required' => false))
            ->add('phone', null, array('required' => false))
            ->end()
            ->with('Social')
            ->add('facebook_url', null, array('required' => false))
            ->add('google_url', null, array('required' => false))
            ->add('twitter_url', null, array('required' => false))
            ->end()
            ->end()
        ;

        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status')
                ->add('locked', null, array('required' => false))
                ->add('isTermsAccepted', null, array(
                    'required' => false,
                    'data' => true,
                ))
                ->add('expired', null, array('required' => false))
                ->add('enabled', null, array('required' => false))
                ->add('credentialsExpired', null, array('required' => false))
                ->end()
            ;
            if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
                $formMapper
                    ->with('Roles')
                    ->add('vip', null, [
                        'required' => false,
                    ])
                    ->add(
                        'realRoles',
                        'sonata_security_roles',
                        array(
                            'expanded' => true,
                            'multiple' => true,
                            'required' => false,
                            'translation_domain' => 'SonataUserBundle',
                            'choices' => $this->rolesLabels,
                        )
                    )
                    ->end()
                ;
            } else {
                $formMapper
                    ->with('Roles')
                    ->add(
                        'realRoles',
                        'sonata_security_roles',
                        array(
                            'label' => 'form.label_roles',
                            'expanded' => true,
                            'multiple' => true,
                            'required' => false,
                            'translation_domain' => 'SonataUserBundle',
                            'choices' => $this->rolesLabelsNoSuper,
                        )
                    )
                    ->end()
                ;
            }
            $formMapper
                ->with('Keys')
                ->add('token', null, array('required' => false))
                ->add('twoStepVerificationCode', null, array('required' => false))
                ->end()
                ->end()
            ;
        }
    }

    public function prePersist($user)
    {
        $user->setIsTermsAccepted(true);
    }

    public function getTemplate($name)
    {
        if ($name == 'delete') {
            return 'CapcoAdminBundle:User:delete.html.twig';
        }

        return parent::getTemplate($name);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media != null) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getUsername(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }
}

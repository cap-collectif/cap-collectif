<?php

namespace spec\Capco\UserBundle\Security\Core\User;

use Capco\UserBundle\Handler\UserInvitationHandler;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use FOS\UserBundle\Model\UserManagerInterface;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Security\Core\User\OauthUserProvider;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Psr\Log\LoggerInterface;

class OauthUserProviderSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OauthUserProvider::class);
    }

    public function let(
        UserManagerInterface $userManager,
        UserRepository $userRepository,
        OpenIDExtraMapper $extraMapper,
        Indexer $indexer,
        GroupMutation $groupMutation,
        FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository,
        LoggerInterface $logger,
        UserInvitationHandler $userInvitationHandler
    ) {
        $this->beConstructedWith(
            $userManager,
            $userRepository,
            $extraMapper,
            $indexer,
            [],
            $groupMutation,
            $franceConnectSSOConfigurationRepository,
            $logger,
            $userInvitationHandler
        );
    }

    public function it_load_new_openid_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        OpenIDExtraMapper $extraMapper
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);

        // We try to find a user that match the criterias, but could not find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn(null);
        $userRepository->findOneByEmail('openid_user@test.com')->willReturn(null);

        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setUsername('openid_user')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setEmail('openid_user@test.com')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user);
        $extraMapper->map($user, $response)->shouldBeCalled();

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_load_existing_openid_user(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);

        // We disable refresh user informations at every login
        $ressourceOwner->isRefreshingUserInformationsAtEveryLogin()->willReturn(false);

        // We try to find a user that match the criterias, and find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn($user);
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user);

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_load_existing_openid_user_and_update_values(
        UserResponseInterface $response,
        UserRepository $userRepository,
        OpenIDResourceOwner $ressourceOwner,
        UserManagerInterface $userManager,
        User $user,
        OpenIDExtraMapper $extraMapper
    ) {
        $this->generateGenericOpenIdResponse($response, $ressourceOwner);

        // We enable refresh user informations at every login
        $ressourceOwner->isRefreshingUserInformationsAtEveryLogin()->willReturn(true);

        // We try to find a user that match the criterias, and find one.
        $userRepository
            ->findByAccessTokenOrUsername('openid_access_token', 'openid_id')
            ->willReturn($user);
        $user->getId()->willReturn('<some uuid>');

        // Here we assert right values are set for the user.
        $user
            ->setOpenId('openid_id')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setOpenIdAccessToken('openid_access_token')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setUsername('openid_user')
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setEmail('openid_user@test.com')
            ->shouldBeCalled()
            ->willReturn($user);
        $extraMapper->map($user, $response)->shouldBeCalled();

        // We flush the new values.
        $userManager->updateUser($user)->shouldBeCalled();

        $this->loadUserByOAuthUserResponse($response)->shouldReturn($user);
    }

    public function it_map(
        UserResponseInterface $response,
        User $user,
        OpenIDResourceOwner $IDResourceOwner
    ) {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';
        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('ala Toto')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }
        $user->setDateOfBirth($birthday)->shouldBeCalled();
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];

        $this->map(
            $user->getWrappedObject(),
            $response->getWrappedObject(),
            $allowedData
        )->shouldReturn($user);
    }

    public function it_map_with_username(UserResponseInterface $response, User $user)
    {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['preferred_username'] = 'toto_fc_username';
        $data['email'] = 'toto@alapla.ge';
        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('toto_fc_username')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }

        $user->setDateOfBirth($birthday)->shouldBeCalled();
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => true,
        ];

        $this->map(
            $user->getWrappedObject(),
            $response->getWrappedObject(),
            $allowedData
        )->shouldReturn($user);
    }

    private function generateGenericOpenIdResponse(
        UserResponseInterface $response,
        OpenIDResourceOwner $ressourceOwner
    ) {
        $ressourceOwner->getName()->willReturn('openid');
        $response->getEmail()->willReturn('openid_user@test.com');
        $response->getNickname()->willReturn('openid_user');
        $response->getAccessToken()->willReturn('openid_access_token');
        $response->getUsername()->willReturn('openid_id');
        $response->getResourceOwner()->willReturn($ressourceOwner);
        $response->getLastName()->willReturn('Smith');
        $response->getFirstName()->willReturn('jean');
    }
}

import { describe, expect, it } from 'vitest';
import { checkPermissions } from '../src/handlers/permissionHandler.js';

const makeInteraction = (inGuild: boolean, hasPermission: boolean) =>
  ({
    inGuild: () => inGuild,
    member: {
      permissions: {
        has: () => hasPermission,
      },
    },
  }) as any;

describe('permissionHandler', () => {
  it('allows commands without requirements', () => {
    const result = checkPermissions(makeInteraction(true, true));
    expect(result.allowed).toBe(true);
  });

  it('blocks when guild-only and not in guild', () => {
    const result = checkPermissions(makeInteraction(false, true), { guildOnly: true });
    expect(result.allowed).toBe(false);
  });

  it('blocks when missing permissions', () => {
    const result = checkPermissions(makeInteraction(true, false), {
      requiredPermissions: ['ManageMessages'],
    });
    expect(result.allowed).toBe(false);
  });
});
